import { Swiper, SwiperSlide } from "swiper/react";
import { SKINNY_RENDER } from "../poster";
import { useNavigate } from "react-router-dom";
import { app_url } from "../..";
import React, { useEffect, useRef } from "react";

export const Full = (props: { data: SKINNY_RENDER; i: number }) => {
  const nav = useNavigate();
  const img = React.useRef<HTMLImageElement>(null);
  const send = (id: string, type: string) => {
    nav(`/render/${type}/${id}`);
  };
  return (
    <div
      onClick={(_) => send(props.data.ID, props.data.TYPE)}
      className="w-screen cursor-pointer"
      style={{ height: "110vh" }}
    >
      <img
        ref={img}
        src={props.data.BACKDROP}
        className="w-screen"
        style={{ height: "110vh" }}
      />
    </div>
  );
};
