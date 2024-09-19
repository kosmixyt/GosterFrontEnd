import fs from "fs";
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
