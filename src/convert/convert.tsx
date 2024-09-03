import { createPortal } from "react-dom";
import { EPISODE, FileItem, MovieItem } from "../render/render";
import { useEffect, useState } from "react";
import { QUALITY, Track } from "../player/player";
import { app_url } from "..";
import { toast } from "react-toastify";
export const QUALITYS = ["1080p", "720p", "480p", "360p", "240p"];

export interface ConvertInfo {
  Qualities: QUALITY[];
  AudioTracks: Track[];
  Paths: string[];
}

export function ConvertModal(props: { file: FileItem; item: MovieItem | EPISODE; hidden: boolean; close: () => void }) {
  if (props.hidden) {
    return <></>;
  }
  const [newFileName, setNewFileName] = useState(props.file.FILENAME);
  const [convertInfo, setConvertInfo] = useState<ConvertInfo | null>(null);
  const [qualityIndex, setQualityIndex] = useState(0);
  const [audioIndex, setAudioIndex] = useState(0);
  const [pathIndex, setPathIndex] = useState(0);
  useEffect(() => {
    var t = toast.info("Loading Convert Info", { autoClose: false });
    fetch(`${app_url}/transcode/options?file_id=${props.file.ID}`, { credentials: "include" })
      .then((res) => res.json())
      .then((body) => {
        setConvertInfo(body);
        toast.update(t, { render: "Convert Info Loaded", type: "success", autoClose: 2000 });
        setPathIndex(0);
        toast.dismiss(t);
      });
  }, []);
  useEffect(() => {
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "auto";
    };
  }, [convertInfo]);
  if (!convertInfo) {
    return <></>;
  }

  console.log(audioIndex)
  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black opacity-50"></div>
      <div className="fixed z-10  rounded-lg p-4 bg-[#181818] flex flex-col ">
        <div>Convert : {props.file.FILENAME}</div>
        <button
          className="bg-red-500 ml-4 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-2"
          onClick={() => {
            console.log("close");
            props.close();
          }}
        >
          Close
        </button>
        <div className="flex justify-center mt-8">
          <div className="w-4/5">
            <div className="w-full text-center">New Filename : </div>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="New File Name"
              className="bg-[#181818] text-white border-b-2 border-white w-full"
            />
            <select
              value={qualityIndex}
              onChange={(e) => setQualityIndex(parseInt(e.target.value))}
              className="bg-[#181818] text-white border-b-2 border-white w-full mt-4"
            >
              {convertInfo.Qualities.map((quality, i) => (
                <option key={i} value={i}>
                  {quality.Name}
                </option>
              ))}
            </select>
            <select
              value={audioIndex}
              onChange={(e) => setAudioIndex(parseInt(e.target.value))}
              className="bg-[#181818] text-white border-b-2 border-white w-full mt-4"
            >
              {convertInfo.AudioTracks.map((audio, i) => (
                <option key={i} value={i}>
                  {audio.Name} {i}
                </option>
              ))}
            </select>
            <select
              value={pathIndex}
              onChange={(e) => setPathIndex(parseInt(e.target.value))}
              className="bg-[#181818] text-white border-b-2 border-white w-full mt-4"
            >
              {convertInfo.Paths.map((path, i) => (
                <option key={i} value={i}>
                  {path}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                post_convert(newFileName, props.file.ID, convertInfo.Qualities[qualityIndex].Resolution, audioIndex, convertInfo.Paths[pathIndex]).then(
                  props.close
                );
              }}
              className="bg-[#181818] text-white border-b-2 border-white w-full mt-4"
            >
              Convert
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
export async function post_convert(newFileName: string, file_id: number, qualityRes: number, audioTrackIndex: number, path: string) {
  console.log(audioTrackIndex);
  const t = toast.info("Converting", { autoClose: false });
  const req = await fetch(
    `${app_url}/transcode/convert?file_id=${file_id}&audio_track_index=${audioTrackIndex}&quality_res=${qualityRes}&filename=${newFileName}&path=${path}`,
    {
      credentials: "include",
    }
  );
  const body = await req.json();
  console.log(body);
  if (body.status === "success") {
    toast.update(t, { render: `Converted task id ${body.task_id}`, type: "success", autoClose: 2000 });
  } else {
    toast.update(t, { render: `Failed to Convert ${body.error}`, type: "error", autoClose: 2000 });
  }
}
