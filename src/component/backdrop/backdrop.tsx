import React, { CSSProperties, useEffect, useState } from "react";
import { GENRE, SKINNY_RENDER } from "../poster";
import { app_url, getMute, setMute } from "../..";
import { miniaHeight, miniaWidth } from "../../landing";

import * as rdd from "react-device-detect";

import "./bc.css";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { FaPlay } from "react-icons/fa6";
import { motion } from "framer-motion";
import { MdOutlineFileDownload } from "react-icons/md";

import "react-tooltip/dist/react-tooltip.css";

import { toast } from "react-toastify";
import { Tooltip } from "primereact/tooltip";
import { createPortal } from "react-dom";
import { nanoid } from "nanoid";
import { GetProgress, MovieItem } from "../../render/render";
// import { PlayButton } from "../playButton/playButton";

export interface BackdropState {
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
  public size =
    this.props.WATCH.TOTAL > 0
      ? this.props.WATCH.CURRENT / this.props.WATCH.TOTAL
      : 0;
  public videoUrl = `${app_url}/trailer?type=${this.props.TYPE}&id=${this.props.ID}#t=10`;
  public hoverTimeout: any | null = null;
  state: BackdropState = {
    isHovering: false,
  };

  public tempElement: HTMLVideoElement | null = null;
  public OpenTimeout: any | null = null;
  public video = React.createRef<HTMLVideoElement>();
  goRender() {
    this.props.nav("/render/" + this.props.TYPE + "/" + this.props.ID);
  }
  render() {
    console.log(this.state.isHovering);
    return (
      <motion.div
        onClick={this.goRender.bind(this)}
        whileHover={{
          zIndex: 100,
          transition: {
            duration: 0.2,
            delay: 1,
          },
        }}
        onHoverStart={() => {
          if (this.hoverTimeout) clearTimeout(this.hoverTimeout);
          this.hoverTimeout = setTimeout(() => {
            this.setState({ isHovering: true });
          }, 1000);
        }}
        onHoverEnd={() => {
          if (this.hoverTimeout) clearTimeout(this.hoverTimeout);
          this.setState({ isHovering: false });
        }}
        className={`cursor-pointer relative pt-8 z-10 w-72 flex`}
      >
        <div>
          <motion.img
            src={this.props.BACKDROP}
            animate={{
              scale: this.state.isHovering ? 1.3 : 1,
              borderRadius: this.state.isHovering ? "1rem" : "0rem",
            }}
            className="object-cover"
          />
          {this.state.isHovering && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center text-white mt-6"
            >
              <div className="">
                <div className="text-xl font-semibold text-center">
                  {this.props.NAME}
                </div>
                <div className="max-h-40 overflow-auto no-scrollbar opacity-50">
                  {this.props.DESCRIPTION}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }
}
async function DeleteFromWatchingList(item: SKINNY_RENDER) {
  const res = await fetch(`${app_url}/`);
}
async function InverseWatchlist(item: SKINNY_RENDER) {}

function ContextMenu(props: {
  x: number;
  y: number;
  close: () => void;
  item: SKINNY_RENDER;
}) {
  const nav = useNavigate();
  const renderId = nanoid();
  useEffect(() => {
    var f = 0;
    const on_click = (e: MouseEvent) => {
      if (f++ === 0) return;
      if (
        (e.target as HTMLElement).getAttribute("data-render-id") !== renderId
      ) {
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
          nav(
            "/player/?transcode=" + encodeURIComponent(props.item.TRANSCODE_URL)
          );
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
          document.location.href =
            app_url +
            "/download?type=" +
            props.item.TYPE +
            "&id=" +
            props.item.ID;
        }}
      >
        Download
      </div>
    </div>
  );
}
