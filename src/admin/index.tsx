import { useNavigate } from "react-router-dom";
import { AdminCleanMovie } from "../metadata/dragger";

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
        </div>
      </div>
    </div>
  );
}
