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
import { WATCH_DATA } from "@/src/render/render";

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
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              duration: 0.5,
            },
          },
        }}
        className={`cursor-pointer relative pt-8 z-10 w-72 flex`}
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
      >
        <div>
          <div
            style={{
              width: `${WatchPercent(this.props.WATCH)}%`,
            }}
            className="h-1 bg-red-800"
          ></div>
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

function WatchPercent(data: WATCH_DATA): number {
  if (data.TOTAL > 0) {
    return (data.CURRENT / data.TOTAL) * 100;
  }
  return 0;
}