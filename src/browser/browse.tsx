import { ScrollRestoration, UNSAFE_useScrollRestoration, useLoaderData, useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./browse.css";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { PosterRenderer, SKINNY_RENDER } from "../component/poster";
import _ from "lodash";
import { ChunkDisplay } from "../component/chunked_display/display";
import { app_url } from "..";
import { LineName } from "../component/lineName";
import { toast } from "react-toastify";

export async function browse_loader(url: string, actionStr: string): Promise<[SKINNY_RENDER[], string]> {
  console.log(url);
  const uri = new URL(url);
  const action = actionStr;
  var lname = "";
  if (!action) {
    console.log("No action");
  }
  var url = `${app_url}`;
  if (action === "genre") {
    lname = "Specific Genre";
    var genre = uri.searchParams.get("genre");
    if (!genre) toast.error("No genre");
    else {
      url += `/browse?genre=${genre}`;
    }
  }
  if (action === "watchlist") {
    lname = "Watchlist";
    url += "/watchlist";
  }
  if (action === "movie" || action === "tv") {
    lname = action === "movie" ? "Movies" : "TV Shows";
    url += "/browse?type=" + action;
  }
  if (action === "provider") {
    lname = "Provider";
    var provider = uri.searchParams.get("provider");
    if (!provider) toast.error("No provider");
    else {
      url += `/browse?type=provider&provider=${provider}`;
    }
  }
  console.log("url", url);
  return [
    await fetch(url, { credentials: "include" })
      .then((res) => {
        if (res.status === 401) {
          return (document.location.href = "/login");
        }
        return res.json();
      })
      .then((res) => res.elements),
    uri.searchParams.get("name") ?? lname,
  ];
}
export function BrowseFunc() {
  const { action } = useParams();
  const [data, setData] = useState<[SKINNY_RENDER[], string] | null>(null);
  useEffect(() => {
    browse_loader(document.location.href, action as string).then((res) => setData(res));
  }, [action]);
  if (!data) return <div>Loading...</div>;
  return (
    <div className="b-ctn">
      <LineName className="flex justify-center mb-4 underline" lineName={data[1]} />
      <ChunkDisplay items={data[0]} />
    </div>
  );
}
