import { useEffect, useState } from "react";
import { MovieItem, TVItem } from "./render";
import { bytesToSize, SearchResults } from "../torrent";
import { app_url } from "..";

export function AvailableTorrrent(props: {
  item: MovieItem | TVItem;
  currentSeason: number;
}) {
  const [torrents, setTorrents] = useState<SearchResults[]>([]);
  const [fetched, setFetched] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [hover, setHover] = useState<boolean>(false);
  useEffect(() => {
    if (props.item.TYPE === "movie") {
      if (props.item.FILES.length > 0) {
        return;
      }
    }
    if (props.item.TYPE === "tv") {
      const currentSeasonHaveFile =
        props.item.SEASONS[props.currentSeason].EPISODES.reduce(
          (prev, cur) => prev + cur.FILES.length,
          0
        ) > 0;
      if (currentSeasonHaveFile) {
        return;
      }
    }
    var url = `${app_url}/torrents/available?type=${props.item.TYPE}&id=${props.item.ID}`;
    if (props.item.TYPE === "tv") {
      url += `&season=${props.item.SEASONS[props.currentSeason].ID}`;
    }
    fetch(url, { credentials: "include" }).then((res) => {
      res.json().then((data) => {
        setFetched(true);
        if (data.error) {
          setError(data.error);
          return;
        }
        setTorrents(data.torrents);
      });
    });
  }, [props.item]);
  if (props.item.TYPE === "movie") {
    if (props.item.FILES.length > 0) {
      return <div></div>;
    }
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
        <div className="absolute z-50 text-white bg-slate-900 bg-opacity-100">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Size</th>
                <th>Seed</th>
                <th>Provider</th>
              </tr>
            </thead>
            <tbody>
              {torrents.map((torrent, i) => (
                <tr className="mt-2" key={i}>
                  <td>{torrent.name}</td>
                  <td>{bytesToSize(torrent.size)}</td>
                  <td>{torrent.seed}</td>
                  <td>{torrent.provider_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
