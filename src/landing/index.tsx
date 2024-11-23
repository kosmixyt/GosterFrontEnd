import React, { useEffect, useRef } from "react";
import { PosterRenderer, SKINNY_RENDER } from "../component/poster";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode, Pagination } from "swiper/modules";
import "swiper/css";
import { motion } from "framer-motion";
import "./main.css";
import { LineName } from "../component/lineName/index";
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
    loader_data.Lines.slice(0, 6)
  );
  const [hasMore, setHasMore] = React.useState<boolean>(true);
  useEffect(() => {
    const onresize = () => {
      setDisplayedData(DisplayedData);
    };
    window.addEventListener("resize", onresize);
    return () => {
      window.removeEventListener("resize", onresize);
    };
  }, []);
  return (
    <div>
      {!isMobile ? (
        <motion.div
          initial={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          animate={{ opacity: 1 }}
        >
          <Swiper
            navigation={true}
            modules={[Autoplay]}
            slidesPerGroup={1}
            slidesPerView={1}
          >
            {loader_data.Recents.Data.map((e, i) => (
              <SwiperSlide key={i}>
                <Full i={i} data={e} />
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      ) : (
        <></>
      )}
      <div
        className="relative z-40"
        style={{ marginTop: `${isMobile ? "80px" : "-320px"}` }}
      >
        <InfiniteScroll
          dataLength={DisplayedData.length}
          next={() => {
            var next = [
              ...DisplayedData,
              loader_data.Lines[DisplayedData.length],
            ];
            if (next.length > loader_data.Lines.length)
              return setHasMore(false);
            else setDisplayedData(next);
          }}
          hasMore={hasMore}
          loader={<h4>Loading...</h4>}
          endMessage={<Bottom home={loader_data} />}
        >
          {DisplayedData.map((line, i) => (
            <LineRender disable_observer={true} line={line} key={i} />
          ))}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export const LineRender = (
  props: { line: Line_Render; disable_observer: boolean },
  k: number
) => {
  const nav = useNavigate();
  var watchingLine = props.line.Title === "Continue Watching";
  const [swiper, setSwiper] = React.useState<any>(null);
  const [PreviousHiddenIndex, setPreviousHiddenIndex] =
    React.useState<boolean>(true);
  if (props.line.Data.length === 0) return <></>;

  return (
    <div className={`${!isMobile ? "ml-2 mr-2 mt-6" : ""}`}>
      <LineName
        className="ml-14"
        key={k}
        more="/"
        lineName={props.line.Title}
      />
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        initial="hidden"
        viewport={{ once: true, amount: 0.2 }}
        whileInView="show" // Lance l'animation quand la div est dans la vue
      >
        <Swiper
          modules={[Pagination]}
          className=""
          slidesPerView={"auto"}
          spaceBetween={!isMobile ? 5 : 1}
          onSwiper={(swiper: any) => setSwiper(swiper)}
        >
          {props.line.Data.map((item: SKINNY_RENDER, e: number) => (
            <SwiperSlide style={{ width: "fit-content" }} key={e}>
              {item.ID.startsWith("tmdb@") ? (
                <PosterRenderer {...item} />
              ) : (
                <BackDrop
                  className={`${e === 0 ? "ml-0" : ""}`}
                  watchingLine={watchingLine}
                  key={e}
                  nav={nav}
                  {...item}
                />
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>
    </div>
  );
};
export const BrowseToWatchlist = () => {
  const nav = useNavigate();
  nav("/browse/watchlist");
  return <div></div>;
};

export function Bottom(props: { home: Api_Home }) {
  const nav = useNavigate();
  return (
    <div>
      <LineName more="/" lineName={"Providers"} />
      <Swiper style={{ position: "relative", zIndex: 4 }} slidesPerView={"auto"} spaceBetween={7}>
        {props.home.Providers[0].Data.map((item, f) => {
          return (
            <SwiperSlide key={f} style={{ width: "fit-content" }}>
              <div
                onClick={() => nav(`/browse/provider?provider=${item.PROVIDER_ID}`)}
                className="h-36 w-36 bg-white rounded-lg shadow-lg flex justify-center items-center"
              >
                <img className="w-full h-full rounded-lg" src={item.URL} alt="" />
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
      <div className="h-48 flex justify-center items-center">
        <div style={{ display: "block", textAlign: "center" }}>
          <div onClick={() => window.open("https://kosmix.fr", "_blank")}>KOSMIX.FR</div>
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
