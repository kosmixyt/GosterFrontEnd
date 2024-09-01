import { useState } from "react";

export function ToolTip(props: { text: string; show: boolean; children: React.ReactNode[] }) {
  if (!props.show) return null;

  return (
    <div onClick={(e) => e.stopPropagation()} className="absolute bg-slate-700 rounded-lg w-auto">
      <div className="tooltip-text">
        {props.children.map((e, i) => {
          return <div className={`border-t-white ${i > 0 ? "border-t-2" : ""} font-semibold p-2`}>{e}</div>;
        })}
      </div>
    </div>
  );
}
