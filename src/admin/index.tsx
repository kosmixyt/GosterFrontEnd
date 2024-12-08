import { useNavigate } from "react-router-dom";
import { AdminCleanMovie } from "../metadata/dragger";
import { app_url } from "..";

export default function Admin() {
  const nav = useNavigate();

  return (
    <div className="flex justify-center">
      <div>
        <div className="text-3xl ml-1 font-bold text-center">Admin Area</div>
        <div className="flex flex-wrap mt-4 gap-2">
          <div
            onClick={AdminCleanMovie}
            className="p-4 bg-gray-800 hover:scale-105 transition-all text-lg font-semibold cursor-pointer rounded-lg text-white"
          >
            Clean Orphelin Movies
          </div>
          <div
            onClick={() => nav("/dragger")}
            className="p-4 bg-gray-800 hover:scale-105 transition-all text-lg font-semibold cursor-pointer rounded-lg text-white"
          >
            Metadata Dragger
          </div>
          <div
            onClick={() => window.open("/pty", "_blank")}
            className="p-4 bg-gray-800 hover:scale-105 transition-all text-lg font-semibold cursor-pointer rounded-lg text-white"
          >
            PTY SHELL
          </div>
          <div
            onClick={() => nav("/admin/files")}
            className="p-4 bg-gray-800 hover:scale-105 transition-all text-lg font-semibold cursor-pointer rounded-lg text-white"
          >
            File Manager
          </div>
          {/* <button
            onClick={() => {
              const pl = {
                channel_id: 46,
                start: Date.now() + 1000 * 3,
                duration: 60,
                output_type: "movie",
                output_id: 386,
                force: true,
                storer_output: "4@/home/storag18/media/series/",
              };
              fetch(`${app_url}/iptv/record/add`, {
                method: "POST",
                body: JSON.stringify(pl),
                credentials: "include",
              });
            }}
          >
            Request
          </button> */}
        </div>
      </div>
    </div>
  );
}
