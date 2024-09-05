import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { InheritGo, PosterRenderer, SKINNY_RENDER } from "../component/poster";
import { app_url } from "..";
import { IoIosCloseCircle } from "react-icons/io";
import { createPortal } from "react-dom";
import { CgSearchLoading } from "react-icons/cg";
import useFetch from "react-fetch-hook";

interface SearchResults {
  elements: SKINNY_RENDER[];
}

export const SearchClass = "rounded-lg h-12 max-w-128 w-128 text-4xl pl-2 pb-2 pt-2";
export function SearchRender(props: { headTitle?: string; specificType?: string; title: string; close: () => void; onselect?: InheritGo }) {
  const [search, setSearch] = useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const nav = useNavigate();
  const [currentQueryParameters, setSearchParams] = useSearchParams();
  const [data, setData] = useState<SearchResults | undefined>(undefined);
  const [timeout, setTm] = useState<NodeJS.Timeout | undefined>(undefined);
  useEffect(() => {
    inputRef.current?.focus();
    document.body.classList.add("overflow-hidden");
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);
  useEffect(() => {
    if (timeout) {
      clearTimeout(timeout);
    }
    const tm = setTimeout(() => {
      fetch(app_url + `/search?query=${search}${props.specificType ? `&type=${props.specificType}` : ""}`, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => setData(data));
    }, 500);
    setTm(tm);
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [search]);
  useEffect(() => {
    const on_key = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (props.onselect) {
          props.onselect?.(e as any, data?.elements[0] as SKINNY_RENDER);
        } else {
          nav(`/render/${data?.elements[0].TYPE}/${data?.elements[0].ID}`);
        }
        return props.close();
      }
    };
    document.addEventListener("keydown", on_key);
    return () => {
      document.removeEventListener("keydown", on_key);
    };
  }, [data]);

  return createPortal(
    <div className="h-full w-full fixed z-20 backdrop-blur-lg top-0 left-0">
      <div className="relative md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 bg-stone-900 h-full w-full  md:w-10/12 md:h-5/6 rounded-lg ">
        <div className="h-full w-full">
          <div className={`flex justify-center items-center flex-row h-1/6`}>
            <div className="ml-4 mr-4 text-center mt-4 mb-4">
              <div>{props.headTitle}</div>
              <div className="flex justify-center">
                <input
                  ref={inputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  type="text"
                  className={SearchClass}
                  placeholder={props.title}
                />
                <button className="ml-2" onClick={props.close}>
                  <IoIosCloseCircle size={40} />
                </button>
              </div>
            </div>
          </div>
          {data?.elements == undefined ? (
            <div className="text-4xl flex justify-center align-middle">
              <CgSearchLoading size={257} />
            </div>
          ) : (
            <div onClick={props.close} className={`flex flex-wrap gap-5 justify-center h-5/6 overflow-auto`}>
              {data?.elements.slice(0, 20).map((element, i) => {
                return <PosterRenderer InheritGo={props.onselect} key={i} {...element} />;
              })}
            </div>
          )}
        </div>
      </div>
    </div>,

    document.body
  );
}
