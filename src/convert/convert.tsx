import { createPortal } from "react-dom";
import { EPISODE, FileItem, MovieItem } from "../render/render";
import { useEffect, useState } from "react";
import { QUALITY, Track } from "../player/player";
import { app_url } from "..";
import { toast } from "react-toastify";
import { StorageRender } from "../torrent";
import { ChooseStorage } from "../component/choosestorage/choosestorage";
export const QUALITYS = ["1080p", "720p", "480p", "360p", "240p"];

export interface ConvertInfo {
  Qualities: QUALITY[];
  AudioTracks: Track[];
  Paths: StorageRender[];
}

export function ConvertModal(props: {
  file: FileItem;
  hidden: boolean;
  close: () => void;
}) {
  if (props.hidden) {
    return <></>;
  }
  const [convertInfo, setConvertInfo] = useState<ConvertInfo | null>(null);
  const [qualityIndex, setQualityIndex] = useState(0);
  const [audioIndex, setAudioIndex] = useState(0);
  const [choosestorage, setChooseStorage] = useState<StorageRender | null>(
    null
  );
  const [askChooseStorage, setAskChooseStorage] = useState(false);
  useEffect(() => {
    var t = toast.info("Loading Convert Info", { autoClose: false });
    fetch(`${app_url}/transcode/options?file_id=${props.file.ID}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((body) => {
        setConvertInfo(body);
        toast.update(t, {
          render: "Convert Info Loaded",
          type: "success",
          autoClose: 2000,
        });
        toast.dismiss(t);
      });
  }, []);
  useEffect(() => {
    return () => {};
  }, [convertInfo]);
  if (!convertInfo) {
    return <></>;
  }
  if (askChooseStorage) {
    return createPortal(
      <ChooseStorage
        close={() => setAskChooseStorage(false)}
        onsuccess={(c, path) => {
          props.close();
          post_convert(
            props.file.ID,
            convertInfo.Qualities[qualityIndex].Resolution,
            audioIndex,
            `${c.id}@${path}`
          );
        }}
      />,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black opacity-50"></div>
      <div className="fixed z-10  rounded-lg p-4 bg-[#181818] flex flex-col ">
        <div className="text-2xl font-semibold">Convert File</div>
        <div className="text-xs font-bold">{props.file.FILENAME}</div>
        <div className="flex justify-center mt-8">
          <div className="w-4/5">
            <select
              value={qualityIndex}
              onChange={(e) => setQualityIndex(parseInt(e.target.value))}
              className="bg-[#181818] text-white border-b-2 border-white w-full p-2 rounded-md"
            >
              {convertInfo.Qualities.map((quality, i) => (
                <option key={i} value={i} className="bg-[#181818] text-white">
                  {quality.Name}
                </option>
              ))}
            </select>
            <select
              value={audioIndex}
              onChange={(e) => setAudioIndex(parseInt(e.target.value))}
              className="bg-[#181818] text-white border-b-2 border-white w-full mt-4 p-2 rounded-md"
            >
              {convertInfo.AudioTracks.map((audio, i) => (
                <option key={i} value={i} className="bg-[#181818] text-white">
                  {audio.Name} {i}
                </option>
              ))}
            </select>

            <div className="flex justify-center w-full">
              <button
                onClick={() => {
                  askChooseStorage
                    ? setAskChooseStorage(false)
                    : setAskChooseStorage(true);
                }}
                className="bg-[#181818] w-1/2 text-white border-b-2 border-white mt-4"
              >
                Choose Storage & Convert
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
export async function post_convert(
  file_id: number,
  qualityRes: number,
  audioTrackIndex: number,
  path: string
) {
  console.log(audioTrackIndex);
  const t = toast.info("Converting", { autoClose: false });
  const req = await fetch(`${app_url}/transcode/convert`, {
    method: "POST",
    body: JSON.stringify({
      file_id,
      quality_res: qualityRes,
      audio_track_index: audioTrackIndex,
      path: path,
    }),
    credentials: "include",
  });
  const body = await req.json();
  console.log(body);
  if (body.status === "success") {
    toast.update(t, {
      render: `Converted task id ${body.task_id}`,
      type: "success",
      autoClose: 2000,
    });
  } else {
    toast.update(t, {
      render: `Failed to Convert ${body.error}`,
      type: "error",
      autoClose: 2000,
    });
  }
}

export async function action_convert(
  action: "pause" | "resume" | "stop",
  task_id: number
) {
  const res = await fetch(
    `${app_url}/transcode/convert/action?action=${action}&convert_id=${task_id}`,
    {
      credentials: "include",
    }
  );
  const body = await res.json();
  if (body.status === "success") {
    toast.success(`Convert ${action}d`);
  } else {
    toast.error(`Failed to ${action} Convert`);
  }
}
