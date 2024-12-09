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
import { MdDelete, MdOutlineFileDownload } from "react-icons/md";

import { AnimatePresence } from "framer-motion";
import "react-tooltip/dist/react-tooltip.css";
import { WATCH_DATA } from "@/src/render/render";
import { toast } from "react-toastify";

export interface BackdropState {
  isHovering: boolean;
  deleted: boolean;
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
    deleted: false,
  };

  public tempElement: HTMLVideoElement | null = null;
  public base64Image: string | null = null;

  public OpenTimeout: any | null = null;
  public video = React.createRef<HTMLVideoElement>();
  goRender() {
    this.props.nav("/render/" + this.props.TYPE + "/" + this.props.ID);
  }
  render() {
    if (this.state.deleted) return <></>;
    return (
      <motion.div
        onClick={this.goRender.bind(this)}
        whileHover={{
          zIndex: 2,
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
        className={`cursor-pointer relative pt-8 w-72 flex`}
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
          <AnimatePresence>
            {this.state.isHovering && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  DeleteFromWatching(this.props.ID, this.props.TYPE).then(
                    () => {
                      this.setState({ deleted: true });
                    }
                  );
                }}
                className="absolute bg-black bg-opacity-50 z-20 rounded-md"
              >
                {this.props.watchingLine ? <MdDelete size={25} /> : <></>}
              </div>
            )}
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              onClick={(e) => {
                if (this.props.watchingLine) {
                  e.stopPropagation();
                  this.props.nav(
                    "/player?transcode=" +
                      encodeURIComponent(this.props.TRANSCODE_URL)
                  );
                }
              }}
              crossOrigin="anonymous"
              onLoad={(e) => {
                this.base64Image = convertImageToBase64(
                  e.target as HTMLImageElement
                );
              }}
              src={this.props.BACKDROP}
              exit={{ opacity: 0 }}
              className="object-fill"
            />
            {/* )} */}
            {/* {this.state.isHovering && (
              <motion.video
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                poster={this.base64Image as string}
                autoPlay
                src={`${app_url}/trailer?type=${this.props.TYPE}&id=${this.props.ID}#t=10`}
                className="object-cover rounded-lg"
              ></motion.video>
            )} */}
          </AnimatePresence>
          <div className="opacity-50 mt-1 font-medium text-center ">
            {this.props.DisplayData}
          </div>
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
function convertImageToBase64(imgElement: HTMLImageElement): string {
  // Crée un canvas
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;

  // Définit les dimensions du canvas pour correspondre à l'image
  canvas.width = imgElement.width;
  canvas.height = imgElement.height;

  // Dessine l'image dans le canvas
  context.drawImage(imgElement, 0, 0);

  // Extrait les données en base64
  return canvas.toDataURL("image/png"); // Remplace 'image/png' par un autre format si nécessaire
}
async function DeleteFromWatching(uuid: string, type: string) {
  const res = await fetch(`${app_url}/continue?uuid=${uuid}&type=${type}`, {
    credentials: "include",
  });
  const data = await res.json();
  if ("status" in data) {
    toast.success("Removed from watching list");
  } else {
    toast.error(`${data.error}`);
  }
}