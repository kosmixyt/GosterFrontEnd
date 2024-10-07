import { SKINNY_RENDER } from "@/src/component/poster";
import { QUALITY, Subtitle } from "@/src/player/player";
import fs from "fs";
import Hls, { Track } from "hls.js";
import path from "path";

declare global {
  interface Window {
    // isMauiApp: boolean;
    electron: {
      SaveCache: (data: string) => void;
      LoadCache: () => string;
      DownloadVideo: (url: string, on_progress: (a: number, b: number) => void) => Promise<void>;
    };
  }
}

export function ElectronSaveCache(data: string) {
  window.electron.SaveCache(data);
  //   fs.writeFileSync
}
export function ElectronLoadCache() {
  return window.electron.LoadCache();
  //   return fs.readFileSync(get_path(), "utf-8");
}

export function ElectronDownload(url: string) {
  return window.electron.DownloadVideo(url, (a, b) => {
    console.log(a, b);
  });
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
