import { MovieItem, TVItem } from "@/src/render/render";
import { PlatformManager } from "../../cordova/platform";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function MiniDisplay(props: { children: React.ReactNode; itemId: string; itemType: string }) {
  const [hovering, setHovering] = useState(false);
  const [data, setData] = useState<MovieItem | TVItem | undefined>(undefined);
  const nav = useNavigate();
  useEffect(() => {
    if (!hovering || data != undefined) return;
    PlatformManager.DispatchCache(props.itemId.toString(), props.itemType.toString()).then((data) => {
      setData(data);
    });
  }, [hovering]);
  console.log(data);
  return (
    <div
      onClick={() => {
        nav(`/render/${props.itemType}/${props.itemId}`);
      }}
      className="flex justify-center cursor-pointer"
    >
      <span onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
        {props.children}
      </span>
      {hovering && data ? (
        <div className="fixed mt-8">
          <div
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            className={`  
            bg-slate-800
            rounded-lg w-72 flex items-center border-2 border-black`}
          >
            <img className="rounded-lg w-32 h-40 ml-4 mt-2 mb-2 " src={data.POSTER} alt="poster" />
            <div className="text-left ml-2">
              <div className="text-lg capitalize font-bold text-white">{data.DISPLAY_NAME}</div>
              <div className="flex gap-1">
                <div className="text-xs opacity-50 capitalize">{data.TYPE}</div>
                <div className="text-xs opacity-50 underline ">{data.YEAR}</div>
              </div>
              <div className="text-xs overflow-auto h-[90px] mb-2 mr-2 no-scrollbar opacity-80">{data.DESCRIPTION}</div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
