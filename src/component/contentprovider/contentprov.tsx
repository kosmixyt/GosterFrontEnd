import React, { createRef, useRef } from "react";
import "./contentprov.css";
//@ts-ignore
import netflixvideo from "./data/netflix.mp4";
//@ts-ignore
import netflixposter from "./data/netflix.png";
import { useNavigate } from "react-router-dom";
// export const NetflixProvider = (props: Provider) => {
//   const nav = useNavigate();
//   return <ProviderRender nav={nav} provider={props} />;
// };

export interface Provider {
  PROVIDER_ID: number;
  URL: string;
  PROVIDER_NAME: string;
  DISPLAY_PRIORITY: number;
}
export interface ProviderRenderProps {
  nav: (where: string) => void;
  provider: Provider;
}
