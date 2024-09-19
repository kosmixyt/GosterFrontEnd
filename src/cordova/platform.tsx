import { DownloadWeb, get_transcode_data } from "./web";
import { EPISODE, FileItem, MovieItem, TVItem } from "../render/render";
import { app_url } from "..";
import { CacheManager } from "./cacheManager";
import { QUALITY, Subtitle, Track } from "../player/player";
import Hls from "hls.js";
import "./electron/electron";
import { SKINNY_RENDER } from "../component/poster";
import { ElectronDownload, ElectronLoadCache, ElectronSaveCache } from "./electron/electron";

export type Platform = "web" | "android" | "electron" | "ios";
export class PlatformManager {
  static platform: Platform = "web";
  public static setPlatform(platform: Platform) {
    PlatformManager.platform = platform;
  }
  constructor() {}
  static GetPlatform(): Platform {
    // @ts-ignore
    if (window.electron) {
      return "electron";
    }
    return PlatformManager.platform;
  }
  static DispatchDownload(url: string, fileInfo: MovieItem | EPISODE, fileId: number) {
    switch (PlatformManager.GetPlatform()) {
      case "web":
        DownloadWeb(url);
        break;
      case "electron":
        ElectronDownload(url);
        break;
    }
  }
  static async DispatchCache(item: string, type: string): Promise<MovieItem | TVItem> {
    if (item == "undefined" || (type !== "movie" && type !== "tv")) throw new Error("Invalid item");
    var render = null;
    render = CacheManager.GetCache(item, type);
    if (!render) {
      const res = await fetch(`${app_url}/render?id=${item}&type=${type}`, { credentials: "include" });
      if (res.status != 200) {
        throw new Error("Failed to fetch data");
      }
      render = await res.json();
      CacheManager.SetCache(item, type, { ...render });
    }
    return render;
  }
  static async SaveCacheDispatcher() {
    console.log("Saving cache");
    switch (PlatformManager.GetPlatform()) {
      case "web":
        console.log("Web platform not supported");
        break;
      case "electron":
        ElectronSaveCache(CacheManager.Save());
        break;
    }
  }
  static DispatchCacheManagerLoad(): string | null {
    switch (PlatformManager.GetPlatform()) {
      case "web":
        console.log("Web platform not supported");
        return null;
      case "electron":
        return ElectronLoadCache();
    }
    return null;
  }
  static DispatchTranscodeData(transcode_uri: string): Promise<TranscodeDATA> {
    console.log(PlatformManager.GetPlatform());
    switch (PlatformManager.GetPlatform()) {
      case "web":
      case "electron":
        console.log("Web platform not supported");
        return get_transcode_data(transcode_uri);
    }
    throw new Error("Invalid platform");
  }
}

export interface TranscodeDATA {
  uuid: string;
  qualitys: QUALITY[];
  tracks: Track[];
  subtitles: Subtitle[];
  download_url: string;
  isBrowserPlayable: boolean;
  manifest: string;
  task_id: string;
  current: number;
  next: SKINNY_RENDER;
  total: number;
  name: string;
  poster: string;
  backdrop: string;
  isLive: boolean;
  create_hls: (
    videoElement: HTMLVideoElement,
    get_current_playback: () => {
      trackIndex: number;
      currentQualityName: string;
      currentTime: string;
    }
  ) => Hls;
  unload: (Hls: Hls) => void;
}

CacheManager.Load(PlatformManager.DispatchCacheManagerLoad());
setInterval(PlatformManager.SaveCacheDispatcher, 1000);
