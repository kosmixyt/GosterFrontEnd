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
      style={{
        height: "110vh",
      }}
      className="relative"
    >
      <div
        className="w-full h-full bg-cover bg-center absolute"
        style={{ backgroundImage: `url('${props.data.BACKDROP}')` }}
      ></div>
      <div className="w-screen h-full absolute bg-gradient-to-b from-transparent to-[#121212]"></div>
    </div>
  );
};
