import { useEffect, useState } from "react";
import { MovieItem, TVItem } from "./render";
import { bytesToSize, SearchResults } from "../torrent";
import { app_url } from "..";
import { set } from "lodash";

export function AvailableTorrrent(props: {
  item: MovieItem | TVItem;
  currentSeason: number;
  download: (torrent_id: number) => void;
  stream: (torrent_id: number) => void;
}) {
  const [torrents, setTorrents] = useState<SearchResults[]>([]);
  const [fetched, setFetched] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [hover, setHover] = useState<boolean>(false);
  useEffect(() => {
    setFetched(false);
    setTorrents([]);
    if (props.item.TYPE === "movie" && props.item.FILES.length > 0) return;
    if (props.item.TYPE === "tv") {
      const currentSeasonHaveFile =
        props.item.SEASONS[props.currentSeason].EPISODES.reduce(
          (prev, cur) => prev + cur.FILES.length,
          0
        ) > 0;
      if (currentSeasonHaveFile) return;
    }
    async function fetchTorrents() {
      const start = Date.now();
      const res = await fetch(
        `${app_url}/torrents/available?type=${props.item.TYPE}&id=${
          props.item.ID
        }${
          props.item.TYPE === "tv"
            ? `&season=${props.item.SEASONS[props.currentSeason].ID}`
            : ""
        }`,
        { credentials: "include" }
      );
      const data = await res.json();
      setFetched(true);
      if (data.error) {
        return setError(data.error);
      }
      setTorrents(data);
      console.log("Fetched in ", Date.now() - start);
    }
    fetchTorrents();
  }, [props.currentSeason, props.item]);
  if (props.item.TYPE === "movie" && props.item.FILES.length > 0) {
    return <div></div>;
  }
  if (props.item.TYPE === "tv") {
    if (
      props.item.SEASONS[props.currentSeason].EPISODES.reduce(
        (prev, cur) => prev + cur.FILES.length,
        0
      ) > 0
    ) {
      return <div></div>;
    }
  }
  if (!fetched) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>{error}</div>;
  }
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      ({torrents.length}) torrents Available
      {hover && (
        <div className="absolute z-50 text-white bg-slate-900 bg-opacity-100 p-4 rounded-lg">
          <table className="gap-y-3">
            <thead>
              <tr>
                <th>Name</th>
                <th>Size</th>
                <th>Seed</th>
                <th>Provider</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              {torrents.map((torrent, i) => (
                <tr className="mt-2" key={i}>
                  <td
                    className="pb-2"
                    onClick={() => window.open(torrent.link)}
                  >
                    {torrent.name}
                  </td>
                  <td>{bytesToSize(torrent.size)}</td>
                  <td>{torrent.seed}</td>
                  <td>{torrent.provider_name}</td>
                  <td>
                    <div className="flex justify-between gap-4">
                      <button onClick={() => props.download(torrent.id)}>
                        Download
                      </button>
                      <button onClick={() => props.stream(torrent.id)}>
                        Stream
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
