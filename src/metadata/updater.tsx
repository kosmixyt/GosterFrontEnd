import { GENRE, SKINNY_RENDER } from "../component/poster";
import { Provider } from "../component/contentprovider/contentprov";
import { useEffect, useRef, useState } from "react";
import { app_url } from "..";
import { createPortal } from "react-dom";
import { IoIosCloseCircle } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { MovieItem, TVItem } from "../render/render";
import { PlatformManager } from "../cordova/platform";
import { move } from "./dragger";

export interface FileMetadata {
  id: number;
  filename: string;
  path: string;
  is_movie: boolean;
  name: string;
  episode_id: number;
  season_id: number;
  year: number;
  itemid: number;
}
export default function () {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [selected, set_selected] = useState<FileMetadata[]>([]);
  useEffect(() => {
    fetch(`${app_url}/metadata/items`, { credentials: "include" })
      .then((res) => res.json())
      .then(setFiles);
  }, []);
  return (
    <div>
      <button
        onClick={() => {
          setFiles(files.filter((e) => e.itemid === 0));
        }}
      >
        Filter Unnassigned
      </button>
      {files.map((e) => (
        <div key={e.id} className="flex items-center mt-2">
          <input
            className="h-10 w-10"
            type="checkbox"
            onChange={(event) => {
              if (event.target.checked) {
                set_selected([...selected, e]);
              } else {
                set_selected(selected.filter((f) => f.id !== e.id));
              }
            }}
          />
          <RenderFile file={e} />
        </div>
      ))}
    </div>
  );
}
function RenderFile(props: { file: FileMetadata }) {
  const [media_type, set_media_type] = useState<"movie" | "tv" | null>(
    props.file.itemid === 0 ? null : props.file.is_movie ? "movie" : "tv"
  );
  const is_not_assigned = props.file.itemid === 0;
  const [tmdb_search, set_tmdb_search] = useState("");
  const [focus, set_focus] = useState(false);
  const [tmdb_data, set_tmdb_data] = useState<SKINNY_RENDER[]>([]);
  const container = useRef<HTMLDivElement>(null);
  const [item, set_item] = useState<MovieItem | TVItem | null>(null);
  const [season_id, set_season_id] = useState<number>();
  const [episode_id, set_episode_id] = useState<number | null>(null);
  useEffect(() => {
    if (tmdb_search === "") return;
    fetch(`${app_url}/search?query=${tmdb_search}&type=${media_type}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data: SKINNY_RENDER[]) => set_tmdb_data(data.slice(0, 10)));
  }, [tmdb_search]);

  useEffect(() => {
    if (!focus) return;
    const handler_focus_out = (event: any) => {
      if (container.current?.contains(event.target)) {
        return;
      }
      set_focus(false);
    };
    document.addEventListener("click", handler_focus_out);
    return () => {
      document.removeEventListener("click", handler_focus_out);
    };
  }, [focus]);
  return (
    <div
      ref={container}
      onFocus={() => set_focus(true)}
      className="flex items-center"
    >
      <div className="flex mr-2">
        <div
          onClick={() => {
            set_media_type(media_type === "movie" ? "tv" : "movie");
          }}
          className={`bg-blue-600  p-2 cursor-pointer rounded-md ml-2 mr-2`}
        >
          {media_type == null ? "Not Assigned" : media_type}
        </div>
      </div>
      {props.file.filename}
      {media_type === "movie" && (
        <div className="ml-3">
          <input
            autoFocus={true}
            value={item ? item.DISPLAY_NAME : tmdb_search}
            onChange={(e) => set_tmdb_search(e.target.value)}
            type="text"
            className="border-2 border-white w-64"
          />
          <div hidden={!focus} className="absolute bg-slate-700 w-64">
            {tmdb_data.map((e, i) => (
              <div key={i} className="flex items-center p-2">
                <img src={e.POSTER} className="h-24 rounded-md" />
                <div className="ml-1">{e.NAME}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {media_type === "tv" && (
        <div>
          <div className="ml-3 flex">
            <div>
              <input
                autoFocus={true}
                value={item ? item.DISPLAY_NAME : tmdb_search}
                onChange={(e) => set_tmdb_search(e.target.value)}
                type="text"
                className="border-2 border-white w-64"
              />
              <div
                hidden={!focus || item != null}
                className="absolute bg-slate-700 w-64"
              >
                {tmdb_data.map((e, i) => (
                  <div
                    onClick={() =>
                      PlatformManager.DispatchCache(e.ID, e.TYPE).then(
                        (item: TVItem) => {
                          set_item(item);
                          set_season_id(item.SEASONS[0].ID);
                          set_episode_id(item.SEASONS[0].EPISODES[0].ID);
                        }
                      )
                    }
                    key={i}
                    className="flex items-center p-2"
                  >
                    <img src={e.POSTER} className="h-24 rounded-md" />
                    <div className="ml-1">{e.NAME}</div>
                  </div>
                ))}
              </div>
            </div>
            {item && (
              <div className="flex">
                <select
                  value={season_id}
                  onChange={(e) => set_season_id(parseInt(e.target.value))}
                  autoFocus={true}
                  className="ml-2"
                >
                  {(item as TVItem).SEASONS.map((e, i) => (
                    <option value={e.ID} key={i}>
                      {e.NAME} - {e.SEASON_NUMBER}
                    </option>
                  ))}
                </select>
                <select
                  value={episode_id ?? ""}
                  onChange={(e) => set_episode_id(parseInt(e.target.value))}
                  autoFocus={true}
                  className="ml-2"
                >
                  {(item as TVItem).SEASONS.find(
                    (e) => e.ID === season_id
                  )?.EPISODES.map((e, i) => (
                    <option value={e.ID} key={i}>
                      {e.NAME} - {e.EPISODE_NUMBER}
                    </option>
                  ))}
                </select>
                <div
                  onClick={() => {
                    move(
                      props.file.id.toString(),
                      item.ID,
                      media_type,
                      season_id as number,
                      episode_id
                    ).then((good) => {
                      set_item(null);
                      set_season_id(null);
                      set_episode_id(null);
                      set_tmdb_search("");
                      set_tmdb_data([]);
                    });
                  }}
                >
                  Valider
                </div>
                <IoIosCloseCircle
                  size={30}
                  onClick={() => {
                    set_item(null);
                    set_season_id(null);
                    set_episode_id(null);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
