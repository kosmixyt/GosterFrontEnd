import { useEffect, useState } from "react";
import { FileItem, MovieItem, TVItem } from "../render/render";
import { SearchRender } from "../search/search";
import { SKINNY_RENDER } from "../component/poster";
import { PlatformManager } from "../cordova/platform";
import { Modal } from "../player/player";
import { createPortal } from "react-dom";
import { IoCaretBackCircleSharp } from "react-icons/io5";
import { app_url } from "..";
import { toast } from "react-toastify";
async function move(
  source: FileItem,
  to: string,
  toType: string,
  season_id: number | null,
  episode_id: number | null
) {
  const form = new FormData();
  form.append("fileid", source.ID.toString());
  form.append("type", toType);
  form.append("id", to);
  if (season_id) form.append("season_id", season_id.toString());
  if (episode_id) form.append("episode_id", episode_id.toString());
  const res = await fetch(`${app_url}/metadata/update`, {
    method: "POST",
    body: form,
    credentials: "include",
  });
  const data = await res.json();
  if (data.error) {
    toast.error(data.error);
  } else if (data.message) {
    toast.success(data.message);
  }
}
export async function AdminCleanMovie() {
  const res = await fetch(`${app_url}/metadata/clean`, {
    credentials: "include",
  });
  const data = await res.json();
  if (data.error) {
    toast.error(data.error);
  } else if (data.message) {
    toast.success(data.message);
  }
}

export function MoveMediaFile(props: { file: FileItem; close: () => void }) {
  const [item, setItem] = useState<MovieItem | TVItem | null>(null);
  const [season, setSeason] = useState<number | null>(null);
  const [episode, setEpisode] = useState<number | null>(null);

  useEffect(() => {
    if ((item?.TYPE === "tv" && season && episode) || item?.TYPE === "movie") {
      move(
        props.file,
        item?.ID as string,
        item?.TYPE as string,
        season,
        episode
      ).then(() => {
        props.close();
      });
    }
  }, [season, episode, item]);
  var selecthit = false;
  if (!item) {
    return (
      <SearchRender
        title={props.file.FILENAME}
        onselect={(e, j) => {
          selecthit = true;
          PlatformManager.DispatchCache(j.ID, j.TYPE).then((item) => {
            console.log("item", item);
            setItem(item);
          });
        }}
        close={() => {
          if (!selecthit) props.close();
        }}
        headTitle={props.file.FILENAME}
      />
    );
  }
  console.log("item", item, season, episode);
  if (item.TYPE === "tv") {
    return createPortal(
      <Modal>
        <div className="bg-slate-800 p-6 rounded-lg">
          {!season ? (
            <div>
              <div className="flex items-center gap-2">
                <IoCaretBackCircleSharp
                  size={25}
                  onClick={() => setItem(null)}
                />
                <div className="text-xl">Choisisser Season Approprié</div>
              </div>
              {item.SEASONS.map((s) => (
                <div
                  className="text-lg text-center"
                  onClick={() => setSeason(s.ID)}
                >
                  Saison {s.SEASON_NUMBER}
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <IoCaretBackCircleSharp
                  size={25}
                  onClick={() => setSeason(null)}
                />
                <div className="text-xl">Choisisser Episode Approprié</div>
              </div>
              {item.SEASONS.find((s) => s.ID === season)?.EPISODES.map((e) => (
                <div
                  className="text-lg text-center"
                  onClick={() => setEpisode(e.ID)}
                >
                  Episode {e.EPISODE_NUMBER}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>,
      document.body
    );
  }
  return <></>;
}
