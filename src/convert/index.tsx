import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { app_url } from "..";
import { bytesToSize } from "../torrent";
import { FormatRuntime } from "../render/render";
import { DisplayTask } from "../component/taskdisplay/taskdisplay";

export type TaskStatus = "ERROR" | "PENDING" | "RUNNING" | "FINISHED" | "CANCELLED";
interface ConvertProgress {
  SOURCE_FILE_ID: number;
  SOURCE_FILE_NAME: string;
  OUTPUT_FILE_NAME: string;
  TaskStatus: TaskStatus;
  TaskError: string;
  Task_id: number;
  Quality: string;
  AudioTrackIndex: number;
  Running: boolean;
  Progress: {
    Frame: number;
    Fps: number;
    Stream_0_0_q: number;
    Bitrate: number;
    Total_size: number;
    Out_time_us: number;
    Out_time_ms: number;
    Out_time: string;
    Dup_frames: number;
    Drop_frames: number;
    Speed: number;
    Progress: "progress" | "end";
    TotalProgress: number;
  };
  Start: number;
}
export function Converts(props: {}) {
  const nav = useNavigate();
  const [progress, setProgress] = React.useState<ConvertProgress[] | null>(null);
  useEffect(() => {
    const f = () => {
      fetch(`${app_url}/transcode/converts`, { credentials: "include" })
        .then((res) => res.json())
        .then((body) => {
          setProgress(body.converts);
        });
    };
    const interval = setInterval(f, 1000);
    f();
    return () => {
      clearInterval(interval);
    };
  }, []);
  return (
    <div className="mt-14 text-white">
      <table className="table-auto w-full">
        <thead>
          <tr>
            <th className="px-4 py-2">Started at</th>
            <th className="px-4 py-2">Source</th>
            <th className="px-4 py-2">Quality</th>
            <th className="px-4 py-2">Output</th>
            <th className="px-4 py-2">Progress</th>
            <th className="px-4 py-2">Current Size</th>
            <th className="px-4 py-2">Speed</th>
            <th className="px-4 py-4">Estimed Final Size</th>
            <th className="px-4 py-4">Estimed Remain Time</th>
          </tr>
        </thead>
        <tbody>
          {progress && progress.length > 0 ? (
            progress.map((p) => {
              const re = p.Progress.TotalProgress;
              var c = new Date(p.Start * 1000);
              const elapsed = (Date.now() - Number(c)) / 1000;

              return (
                <>
                  <tr>
                    <td className="border px-4 py-2">
                      {c.toLocaleDateString()}
                      &nbsp;{c.toLocaleTimeString()}
                    </td>
                    <td className="border px-4 py-2">{p.SOURCE_FILE_NAME}</td>
                    <td className="border px-4 py-2">{p.Quality}</td>
                    <td className="border px-4 py-2">{p.OUTPUT_FILE_NAME}</td>
                    <td className="border px-4 py-2">{(100 * p.Progress.TotalProgress).toFixed(2)}%</td>
                    <td className="border px-4 py-2">{bytesToSize(p.Progress.Total_size)}</td>
                    {p.TaskStatus === "RUNNING" && (
                      <>
                        <td className="border px-4 py-2">{p.Progress.Speed} s/s</td>
                        <td className="border px-4 py-2">{bytesToSize((1 / p.Progress.TotalProgress) * p.Progress.Total_size)}</td>
                        <td className="border px-4 py-2">{Math.round(elapsed / re)}s</td>
                      </>
                    )}
                    {p.TaskStatus === "FINISHED" && (
                      <td className="border px-4 py-" colSpan={3}>
                        Task Finished
                      </td>
                    )}
                    {p.TaskStatus === "ERROR" && (
                      <td className="border px-4 py-" colSpan={3}>
                        Task Error {p.TaskError}
                      </td>
                    )}
                  </tr>
                </>
              );
            })
          ) : (
            <tr>
              <td colSpan={9} className="border px-4 py-2">
                No Convert Running
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
