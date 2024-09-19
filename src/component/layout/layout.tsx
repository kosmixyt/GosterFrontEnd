import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { KeyboardEvent, MouseEvent, MouseEventHandler, useCallback, useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { RiCompassDiscoverFill } from "react-icons/ri";
import { MdMovieCreation } from "react-icons/md";
import { Outlet } from "react-router-dom";
import { MdAccountCircle } from "react-icons/md";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CgWebsite } from "react-icons/cg";
import { PiTelevisionSimpleDuotone } from "react-icons/pi";
import { FaSearch } from "react-icons/fa";
import { BsBroadcastPin } from "react-icons/bs";
import { IoTvSharp } from "react-icons/io5";
import { SearchRender } from "../../search/search";
import { Loader } from "../loader/loader";
import { CacheManager } from "../../cordova/cacheManager";

const iconSize = 35;
const showName = false;
export const Head = (props: {}) => {
  const go = useNavigate();
  const nav = (path: string) => {
    if (document.location.href.includes("/login")) return;
    go(path);
  };
  const [isSearch, setSearch] = useState(false);
  const buttonStyle = "text-2xl cursor-pointer electron-no-draggable";
  if (document.location.href.includes("/player") || document.location.href.includes("/pty")) {
    return (
      <>
        <ToastContainer />
        <Outlet />
      </>
    );
  }
  return (
    <div>
      <div className="">
        <ToastContainer />
        <div className="electron-draggable top-0 left-0 sticky z-20 h-[51px] bg-stone-900 flex pt-2 pb-2 gap-10 sm:gap-14 align-baseline justify-center overflow-auto">
          {isSearch ? <SearchRender title={"Search ..."} close={() => setSearch(false)} /> : <></>}
          <div className={buttonStyle} onClick={() => nav("/")}>
            <RiCompassDiscoverFill size={iconSize} />
            {showName ? <div className="block text-xs text-center">Discover</div> : <></>}
          </div>
          <div className={buttonStyle} onClick={() => nav("/browse/movie")}>
            <MdMovieCreation size={iconSize} />
            {showName ? <div className="block text-xs text-center">Movies</div> : <></>}
          </div>
          <div className={buttonStyle} onClick={() => nav("/browse/tv")}>
            <PiTelevisionSimpleDuotone size={iconSize} />
            {showName ? <div className="block text-xs text-center">TV</div> : <></>}
          </div>
          <div className={buttonStyle} onClick={() => nav("/providers")}>
            <BsBroadcastPin size={iconSize} />
            {showName ? <div className="block text-xs text-center">Providers</div> : <></>}
          </div>
          <div className={buttonStyle} onClick={() => setSearch(!isSearch && !document.location.href.includes("/login"))}>
            <FaSearch size={iconSize} />
            {showName ? <div className="block text-xs text-center">Search</div> : <></>}
          </div>
          <div className={buttonStyle} onClick={() => nav("/me")}>
            <MdAccountCircle size={iconSize} />
            {showName ? <div className="block text-xs text-center">Me</div> : <></>}
          </div>
          {/* <button onClick={() => CacheManager.Clear()}>Clear cahe</button> */}
        </div>
      </div>
      <Outlet />
    </div>
  );
};
