import React, { CSSProperties, useEffect, useState } from "react";
import { GENRE, SKINNY_RENDER } from "../poster";
import { app_url, getMute, setMute } from "../..";
import { miniaHeight, miniaWidth } from "../../landing";

import * as rdd from "react-device-detect";

import "./bc.css";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { FaPlay } from "react-icons/fa6";
import { MdOutlineFileDownload } from "react-icons/md";

import "react-tooltip/dist/react-tooltip.css";

import { toast } from "react-toastify";
import { Tooltip } from "primereact/tooltip";
import { createPortal } from "react-dom";
import { nanoid } from "nanoid";
import { GetProgress, MovieItem } from "../../render/render";
// import { PlayButton } from "../playButton/playButton";

export interface BackdropState {
  hover: boolean;
  videoMuted: boolean;
  contextMenu: React.MouseEvent<HTMLDivElement> | null;
  isHovering: boolean;
}

var hightZindex = 4;
const HoverMulti = 1.5;
export type BackDropProps = SKINNY_RENDER & {
  nav: NavigateFunction;
  disableHover?: boolean;
  watchingLine: boolean;
  className?: string;
};

export class BackDrop extends React.Component<BackDropProps> {
  public container = React.createRef<HTMLDivElement>();
  public imgContainer = React.createRef<HTMLImageElement>();
  public LogoContainer = React.createRef<HTMLImageElement>();
  public left = 0;
  public top = 0;
  public size = this.props.WATCH.TOTAL > 0 ? this.props.WATCH.CURRENT / this.props.WATCH.TOTAL : 0;
  public active = false;
  public width = 0;
  public videoUrl = `${app_url}/trailer?type=${this.props.TYPE}&id=${this.props.ID}#t=10`;
  public height = 0;
  state: BackdropState = {
    isHovering: false,
    contextMenu: null,
    hover: false,
    videoMuted: false,
  };

  public tempElement: HTMLVideoElement | null = null;
  public OpenTimeout: any | null = null;
  public video = React.createRef<HTMLVideoElement>();
  goRender() {
    this.props.nav("/render/" + this.props.TYPE + "/" + this.props.ID);
  }
  componentDidMount(): void {
    this.active = true;
  }

  componentWillUnmount(): void {
    this.active = false;
  }
  browseGenre(i: GENRE, e: React.MouseEvent<HTMLSpanElement>) {
    e.stopPropagation();
    this.props.nav(`/browse/genre?genre=${i.ID}&name=${encodeURIComponent(`Dans la catégorie ${i.NAME}`)}`);
  }
  mouseDown(e: React.MouseEvent<HTMLDivElement>) {
    console.log("down");
  }
  mouseEnter(e: React.MouseEvent<HTMLDivElement>) {
    this.setState({ isHovering: true });
    if (this.state.contextMenu !== null) return;
    this.OpenTimeout = setTimeout(() => {
      // console.log("open");
      this.setState({ hover: true });
      // this.checkOutOfScreen()
      // console.log("realopen");
      if (this.video.current) {
        this.video.current!.src = this.videoUrl;
        this.video.current!.load();
        this.video.current!.muted = this.state.videoMuted;
        this.video
          .current!.play()
          .catch((e) => {
            //this.imgContainer.current!.hidden = false;
            this.imgContainer.current!.classList.remove("cacher");
          })
          .then(() => {
            //this.imgContainer.current!.hidden = true;
            this.imgContainer.current!.classList.add("cacher");
            if (this.LogoContainer.current) {
              const on_update = () => {
                if (this.video.current === null) return;
                if (this.video.current!.currentTime > 1) {
                  this.LogoContainer.current!.src = this.props.LOGO;
                  this.LogoContainer.current!.hidden = false;
                  this.video.current!.removeEventListener("timeupdate", on_update);
                }
              };
              this.video.current!.addEventListener("timeupdate", on_update);
              this.LogoContainer.current!.addEventListener("error", (e) => {
                this.LogoContainer.current!.remove();
              });
            } else {
              if (!this.video.current) return;
              if (this.video.current.currentTime === 0) this.imgContainer.current!.classList.remove("cacher");
              //this.imgContainer.current!.hidden = false;
            }
          });

        if (getMute() && this.video.current) {
          // this.video.current.muted = getMute();
          this.setState({ videoMuted: getMute() });
        }
      }
    }, 300);
  }
  closeContextMenu() {
    this.setState({
      contextMenu: null,
    });
  }
  checkOutOfScreen() {
    if (this.container.current === null) return;
    const rect = this.container.current.getBoundingClientRect();
    if (rect.left + rect.width > window.innerWidth) {
      this.container.current.style.zIndex = "30";
      this.container.current.style.left = window.innerWidth - rect.width + "px";
    }
  }

  mouseLeave(_: React.MouseEvent<HTMLDivElement>) {
    this.setState({ isHovering: false });
    // this.container.current!.style.left = "0px";
    if (this.OpenTimeout) clearTimeout(this.OpenTimeout);
    this.container.current!.style.zIndex = "1";
    this.setState({ hover: false });
    // this.imgContainer.current!.hidden = false;
    this.imgContainer.current!.classList.remove("cacher");
    if (this.video.current) this.video.current!.src = "";
  }
  setBarVisible(event: React.MouseEvent<HTMLDivElement>) {
    this.setState({ barvisible: true });
    event.stopPropagation();
  }
  hideBar() {
    setTimeout(() => {
      if (this.video.current) this.video.current!.pause();
      this.setState({ barvisible: false, hover: false });
      this.video.current!.src = "";
    }, 100);
  }
  unmute(event: React.MouseEvent<HTMLImageElement>) {
    event.stopPropagation();
    if (!this.video.current) return;
    setMute(!this.video.current!.muted);
    this.setState({ videoMuted: !this.state.videoMuted });
  }
  play(e: React.MouseEvent) {
    e.stopPropagation();
    // this.props.nav(`/player/?transcode=${encodeURIComponent(this.props.TRANSCODE_URL)}`);
    console.log("unimplemented");
  }
  render() {
    return (
      <div
        onContextMenu={(e) => {
          this.setState({ contextMenu: e });
          e.preventDefault();
        }}
        className={`relative ${this.props.className} mt-16 mb-20 w-72 ${
          this.state.contextMenu === null ? "hover:animate-zoomIn focus:animate-zoomIn" : ""
        } rounded-[0.5rem] hover:cursor-pointer hover:bg-[#181818]`}
        onMouseEnter={this.mouseEnter.bind(this)}
        onMouseLeave={this.mouseLeave.bind(this)}
        onClick={this.goRender.bind(this)}
        ref={this.container}
      >
        <div className="h-1 absolute z-20 bg-red-700" style={{ width: GetProgress(this.props.WATCH) }}></div>
        {this.state.contextMenu !== null &&
          createPortal(
            <ContextMenu
              item={this.props}
              x={this.state.contextMenu.clientX + window.scrollX}
              y={this.state.contextMenu.clientY + window.scrollY}
              close={() => this.closeContextMenu()}
            />,
            document.body
          )}
        <img alt="backdrop" ref={this.imgContainer} className="absolute rounded-[0.5rem] w-full aspect-video" src={this.props.BACKDROP} />
        <div className="w-full h-full">
          <video ref={this.video} className={`object-cover rounded-inherit w-full aspect-video`} muted={this.state.videoMuted} preload="none" loop={true}>
            <source src={this.videoUrl + "#t=10"} type="video/mp4" />
          </video>
        </div>
        <div className={`${!this.state.isHovering ? "hidden" : "hidden"}`}>
          <div
            title={this.props.NAME}
            className="text-white ml-1 mt-2 text-center text-sm font-normal underline underline-offset-4 flex justify-center"
            style={{ fontFamily: "Poetsen One" }}
          ></div>
          <div className={`flex ${this.props.PROVIDERS.length > 0 ? "justify-between" : "justify-center"}`}>
            <div className="text-blue-500 text-[13px] font-light mt-1.5 ml-1 flex" style={{ fontFamily: "Poetsen One" }}>
              <div
                onClick={(e) => {
                  this.props.nav(`/browse/${this.props.TYPE === "movie" ? "movie" : "tv"}`);
                  e.stopPropagation();
                }}
              >
                {this.props.TYPE.toUpperCase()}
              </div>
              &nbsp;|&nbsp;{this.props.YEAR}
            </div>
            <div className={`flex justify-between mt-1 gap-1 mb-1 mr-1 ml-1 overflow-hidden`}>
              {this.props.PROVIDERS.slice(0, 4).map((e, i) => (
                <img
                  key={i}
                  alt=""
                  onClick={(event) => {
                    event.stopPropagation();
                    this.props.nav(`/browse/provider?provider=${e.PROVIDER_ID}`);
                  }}
                  className="h-6 rounded-lg"
                  src={e.URL}
                />
              ))}
            </div>
          </div>
          <div className="max-h-10 overflow-auto hidden text-[10px] desc">{this.props.DESCRIPTION}</div>
        </div>
      </div>
    );
  }
}
async function DeleteFromWatchingList(item: SKINNY_RENDER) {
  const res = await fetch(`${app_url}/`);
}
async function InverseWatchlist(item: SKINNY_RENDER) {}

function ContextMenu(props: { x: number; y: number; close: () => void; item: SKINNY_RENDER }) {
  const nav = useNavigate();
  const renderId = nanoid();
  useEffect(() => {
    var f = 0;
    const on_click = (e: MouseEvent) => {
      if (f++ === 0) return;
      if ((e.target as HTMLElement).getAttribute("data-render-id") !== renderId) {
        props.close();
      }
    };
    window.addEventListener("click", on_click);
    window.addEventListener("contextmenu", on_click);
    return () => {
      console.log("remove");
      window.removeEventListener("contextmenu", on_click);
      window.removeEventListener("click", on_click);
    };
  }, []);
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`absolute z-10 p-3 font-semibold rounded-[0.5rem] shadow-lg bg-slate-800`}
      data-render-id={renderId}
      style={{
        top: props.y,
        left: props.x,
      }}
    >
      <div
        className=" cursor-pointer"
        onClick={() => {
          nav("/render/" + props.item.TYPE + "/" + props.item.ID);
        }}
      >
        Plus de détails
      </div>
      <div
        className=" cursor-pointer"
        onClick={() => {
          window.open(`/render/${props.item.TYPE}/${props.item.ID}`, "_blank");
          props.close();
        }}
      >
        Ouvrir dans un nouvel onglet
      </div>
      <div
        className=" cursor-pointer"
        onClick={() => {
          nav("/player/?transcode=" + encodeURIComponent(props.item.TRANSCODE_URL));
        }}
      >
        Regarder
      </div>
      <div
        hidden={props.item.WATCH.CURRENT === 0}
        onClick={() => {
          DeleteFromWatchingList(props.item)
            .then(() => {})
            .catch(() => {});
        }}
        className="text-red-700 cursor-pointer"
      >
        Supprimer des "à reprendre"
      </div>
      <div
        className="text-blue-500 cursor-pointer"
        onClick={() => {
          InverseWatchlist(props.item)
            .then(() => {})
            .catch(() => {});
        }}
      >
        {props.item.WATCHLISTED ? "Remove from Watchlist" : "Add to Watchlist"}
      </div>
      <div
        onClick={(e) => {
          e.stopPropagation();
          document.location.href = app_url + "/download?type=" + props.item.TYPE + "&id=" + props.item.ID;
        }}
      >
        Download
      </div>
    </div>
  );
}
