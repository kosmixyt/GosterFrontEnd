import React, { useEffect, useRef } from "react";
import { PosterRenderer, SKINNY_RENDER } from "../component/poster";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode, Pagination } from "swiper/modules";
import "swiper/css";
import { motion } from "framer-motion";
import "./main.css";
import { app_url } from "..";
import { BackDrop } from "../component/backdrop/backdrop";
import { Full } from "../component/full/full";
import { Provider } from "../component/contentprovider/contentprov";
import {
  ScrollRestoration,
  useLoaderData,
  useNavigate,
} from "react-router-dom";
import _, { min } from "lodash";
import InfiniteScroll from "react-infinite-scroll-component";
import "../cordova/platform";
//@ts-ignore
import prev from "./icon/prev.svg";
//@ts-ignore
import next from "./icon/next.svg";
import { isMobile } from "react-device-detect";
import { createPortal } from "react-dom";

export interface WATCHING_RENDER {
  ITEM: SKINNY_RENDER;
  CURRENT: number;
  TOTAL: number;
  EPISODE_ID: number;
  FILE_ID: number;
}
export interface Line_Render {
  Data: SKINNY_RENDER[];
  Title: string;
  Type: string;
}
export interface Line_Render_Provider {
  Data: Provider[];
  Title: string;
  Type: string;
}
export interface Dimension {
  width: number;
  height: number;
}

export interface Api_Home {
  Recents: Line_Render;
  Lines: Line_Render[];
  Providers: Line_Render_Provider[];
}

const GetGoodMiniaDimmensions = (): Dimension => {
  var bodyWidth = window.innerWidth;
  var bodyHeight = window.innerHeight;
  // var ratio = 553 / 300;
  var ratio = 16 / 9;
  var numberPerLine = 6;
  var width = bodyWidth / numberPerLine;
  var height = bodyHeight / numberPerLine;
  if (width / ratio > height) {
    width = height * ratio;
  } else {
    height = width / ratio;
  }
  return { width, height };
};
export const miniaHeight = () => GetGoodMiniaDimmensions().height;
export const miniaWidth = () => GetGoodMiniaDimmensions().width;

export function landing_loader(request: any) {
  return fetch(`${app_url}/home`, { credentials: "include" }).then((res) => {
    if (res.status === 401) {
      document.location.href = "/login";
    }
    return res.json();
  });
}

export const Landing = () => {
  const loader_data = useLoaderData() as Api_Home;
  const [DisplayedData, setDisplayedData] = React.useState<Line_Render[]>(
    loader_data.Lines.slice(0, 4)
  );
  const [hasMore, setHasMore] = React.useState<boolean>(true);
  useEffect(() => {}, []);
  return (
    <div className="">
      {/* <RenderData
        data={loader_data.Recents.Data}
        name={"Recents"}
        mode="backdrop"
      /> */}
      <Swiper>
        {loader_data.Recents.Data.map((item, f) => {
          return (
            <SwiperSlide key={f}>
              <Full i={f} data={item} />
            </SwiperSlide>
          );
        })}
      </Swiper>

      <InfiniteScroll
        className="mt-6"
        loader={<h4>Loading...</h4>}
        dataLength={DisplayedData.length}
        next={() => {
          if (loader_data.Lines.length > DisplayedData.length) {
            setDisplayedData(
              loader_data.Lines.slice(0, DisplayedData.length + 4)
            );
          } else {
            setHasMore(false);
          }
        }}
        hasMore={hasMore}
      >
        {DisplayedData.filter((e) => e.Data.length > 0).map((item, f) => {
          return (
            <RenderData
              key={f}
              data={item.Data}
              name={item.Title}
              mode={item.Data[0].ID.startsWith("tmdb") ? "poster" : "backdrop"}
            />
          );
        })}
      </InfiniteScroll>
    </div>
  );
};

function RenderData(props: {
  data: SKINNY_RENDER[];
  name: string;
  mode: "backdrop" | "poster";
}) {
  const nav = useNavigate();
  return (
    <div className="mt-6">
      <div className="text-white text-2xl pl-6 font-semibold w-full">
        {props.name}
      </div>
      <Swiper
        modules={[FreeMode]}
        freeMode={true}
        spaceBetween={props.mode === "backdrop" ? 5 : 1}
        slidesPerView={"auto"}
      >
        {props.data.map((item, f) => {
          return (
            <SwiperSlide
              key={f}
              style={{
                width: "fit-content",
              }}
            >
              {props.mode === "backdrop" ? (
                <BackDrop
                  watchingLine={props.name === "Watching"}
                  {...item}
                  nav={nav}
                />
              ) : (
                <PosterRenderer {...item} />
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}

export const BrowseToWatchlist = () => {
  const nav = useNavigate();
  nav("/browse/watchlist");
  return <div></div>;
};

export function Bottom(props: { home: Api_Home }) {
  const nav = useNavigate();
  return (
    <div>
      <Swiper
        style={{ position: "relative", zIndex: 4 }}
        slidesPerView={"auto"}
        spaceBetween={7}
      >
        {props.home.Providers[0].Data.map((item, f) => {
          return (
            <SwiperSlide key={f} style={{ width: "fit-content" }}>
              <div
                onClick={() =>
                  nav(`/browse/provider?provider=${item.PROVIDER_ID}`)
                }
                className="h-36 w-36 bg-white rounded-lg shadow-lg flex justify-center items-center"
              >
                <img
                  className="w-full h-full rounded-lg"
                  src={item.URL}
                  alt=""
                />
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
      <div className="h-48 flex justify-center items-center">
        <div style={{ display: "block", textAlign: "center" }}>
          <div>AUCUN DROIT RESERVEE</div>
          <div
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
          >
            Go To top
          </div>
        </div>
      </div>
    </div>
  );
}
