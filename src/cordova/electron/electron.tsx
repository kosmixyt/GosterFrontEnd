import { toast } from "react-toastify";
import os from "os";
import fs from "fs";
import * as child_process from "child_process";
import { ipcRenderer } from "electron";
import fetch from "node-fetch";
import express from "express";
import { EPISODE, FileItem, MovieItem, PROVIDER, SEASON, TVItem } from "../../render/render";
import { GENRE, PROVIDERItem } from "../../component/poster";
//@ts-ignore
var expressApp: typeof express = null;
//@ts-ignore
var ros: typeof os = null;
//@ts-ignore
var rfs: typeof fs = null;
//@ts-ignore
var rfetch: typeof fetch = null;
//@ts-ignore
var ipc: typeof ipcRenderer = null;
//@ts-ignore
var cp: typeof child_process = null;
if (window.require) cp = window.require("child_process");
if (window.require) expressApp = window.require("express");
if (window.require) if (window.require) ipc = window.require("electron").ipcRenderer;
if (window.require) rfetch = window.require("node-fetch");
if (window.require) ros = window.require("os");
if (window.require) rfs = window.require("fs");
const DownloadingIds = new Set<string>();
export async function ElectronDownload(url: string, fileInfo: MovieItem | EPISODE) {
  var cookies = await ipc.invoke("get-cookies");
  const info = toast.info("Downloading", { autoClose: false });
  DownloadingIds.add(`${fileInfo.ID}_${fileInfo.TYPE}`);
  cookies = cookies.map((cookie: any) => `${cookie.name}=${cookie.value}`).join("; ");
  const res = await rfetch(url, {
    headers: {
      cookie: cookies,
    },
  });
  if (res.status !== 200 || res.body === null) {
    toast.update(info, { render: "Failed to download", type: "error" });
    return;
  }
  var writted = 0;
  var last_percent = 0;
  const file_id_final = res.headers.get("X-File-ID");
  if (!file_id_final) {
    toast.update(info, { render: "Failed to download", type: "error" });
    return;
  }
  const dl_path = GetDownloadPath() + get_file_name(parseInt(file_id_final));
  if (rfs.existsSync(dl_path)) {
    toast.update(info, { render: "File already downloaded", type: "info" });
    return;
  }
  const file = rfs.createWriteStream(dl_path);
  for await (const chunk of res.body) {
    file.write(chunk);
    writted += chunk.length;
    const percent = (writted / parseInt(res.headers.get("content-length") ?? "0")) * 100;
    if (percent - last_percent > 1) {
      last_percent = percent;
      toast.update(info, { render: `Downloading ${percent.toFixed(2)}%`, type: "info" });
    }
  }
  DownloadingIds.delete(`${fileInfo.ID}_${fileInfo.TYPE}`);
  file.close();
  toast.update(info, { render: `Downloaded ${get_item_name(fileInfo)} `, type: "success" });
}
export const GetDownloadPath = () => {
  const dl_path = get_app_path() + "/xxxdownloads/";

  if (!rfs.existsSync(dl_path)) {
    rfs.mkdirSync(dl_path);
  }
  return dl_path;
};
export function get_app_path() {
  var p = ros.homedir() + "/xxxapp/";
  if (!rfs.existsSync(p)) {
    rfs.mkdirSync(p);
  }
  return p;
}
export function get_hls_path() {
  var p = get_app_path() + "/xxxhls/";
  if (!rfs.existsSync(p)) {
    rfs.mkdirSync(p);
  }
  return p;
}

export function get_file_name(fileId: number) {
  return `${fileId}.mp4`;
}
function get_item_name(item: MovieItem | EPISODE) {
  switch (item.TYPE) {
    case "episode":
      return `${item.NAME} Episode ${item.EPISODE_NUMBER}`;
    case "movie":
      return `${item.DISPLAY_NAME}`;
  }
}
export function electron_has_file(fileId: number) {
  console.log(rfs.existsSync(GetDownloadPath() + get_file_name(fileId)));
  return rfs.existsSync(GetDownloadPath() + get_file_name(fileId));
}
export function electron_save_cache(data: string) {
  const cache_path = get_app_path() + "/xxxcache.json";
  rfs.writeFileSync(cache_path, data);
}
export function electron_load_cache() {
  const cache_path = get_app_path() + "/xxxcache.json";
  if (!rfs.existsSync(cache_path)) {
    return null;
  }
  return rfs.readFileSync(cache_path).toString();
}
