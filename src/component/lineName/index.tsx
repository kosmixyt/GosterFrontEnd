import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
// id = ln

export interface LineNameProps {
  lineName: string;
  more?: string;
  className?: string;
}

export const LineName = (props: LineNameProps) => {
  const nav = useNavigate();
  const send = () => {
    if (!!props.more) {
      nav(props.more);
    }
  };
  return (
    <div
      style={{
        fontFamily: "Poetsen One",
      }}
      className={`relative z-10 ${props.className} font-semibold`}
    >
      <div onClick={send} className="text-2xl md:text-3xl font-bold cursor-pointer opacity-75 hover:opacity-100">
        {props.lineName}
      </div>
    </div>
  );
};
