import { toast } from "react-toastify";
import Hls from "hls.js";
import { app_url } from "..";
import { TranscodeDATA } from "./platform";

export function DownloadWeb(url: string) {
  document.location.href = url;
}

export async function get_transcode_data(uri: string) {
  var base_data = await new Promise<TranscodeDATA>((resolve, reject) => {
    const eventSource = new EventSource(uri as string, {
      withCredentials: true,
    });
    const info = toast.info("Transcoding in progress", { autoClose: false });
    eventSource.addEventListener("progress", (e) => {
      toast.update(info, { render: e.data });
    });
    eventSource.addEventListener("transcoder", (e) => {
      const data = JSON.parse(e.data);
      resolve(data);
      toast.dismiss(info);
      eventSource.close();
    });
    eventSource.addEventListener("serverError", (e) => {
      reject(e.data);
      toast.update(info, { render: e.data, autoClose: 5000 });
      eventSource.close();
    });
  });

  base_data.create_hls = function (
    videoElement: HTMLVideoElement,
    get_current_playback: () => {
      trackIndex: number;
      currentQualityName: string;
      currentTime: string;
    }
  ): Hls {
    const xhrProxy = (xhr: XMLHttpRequest, url: string) => {
      xhr.withCredentials = true;
      if (url.includes("m3u8")) {
        return;
      }
      const { trackIndex, currentQualityName, currentTime } = get_current_playback();
      xhr.setRequestHeader("X-QUALITY", currentQualityName);
      xhr.setRequestHeader("x-current-time", currentTime.toString());
      xhr.setRequestHeader("X-TRACK", trackIndex.toString());
    };
    const hls = new Hls({
      startPosition: base_data.current ?? 0,
    });
    hls.config.xhrSetup = (xhr, url) => xhrProxy(xhr, url);
    hls.loadSource(base_data.manifest);
    hls.attachMedia(videoElement);
    hls.on(Hls.Events.ERROR, (event, data) => {
      console.log(event, data);
    });

    return hls;
  };
  base_data.unload = function (hls: Hls) {
    console.log("Unloading");
    fetch(app_url + `/transcode/stop/${base_data.uuid}`, {
      credentials: "include",
    });
    hls.destroy();
  };

  return base_data;
}
