import { MovieItem, TVItem } from "@/src/render/render";
import Hls from "hls.js";
import { get_transcode_data } from "../web";
import { electron_has_file, get_file_name, get_hls_path, GetDownloadPath } from "./electron";
import * as child_process from "child_process";
import { QUALITY, Subtitle, Track } from "@/src/player/player";
import { CacheManager } from "../cacheManager";
import { FFPROBE_DATA } from "./types";
import { EventEmitter } from "events";
//@ts-ignore
var cp: typeof child_process = null;
if (window.require) cp = window.require("child_process");
var Transcode: TranscoderUtilisateur | null = null;
export class TranscoderUtilisateur {
  public currentSegment = 0;
  public startIndex = 0;
  public currentTrack = 0;
  public ffprobe: FFPROBE_DATA | null = null;
  public fileId: number;
  public filePath: string;
  public static hls_time = 10;
  public on = new EventEmitter();
  public Length = 0;
  public process: child_process.ChildProcess | null = null;
  constructor(fileId: number, filePath: string) {
    this.fileId = fileId;
    this.filePath = filePath;
    this.currentSegment = -1;
    // Transcodes.set(fileId, this);
    Transcode = this;
    this.startIndex = -1;
    this.currentTrack = -1;
  }
  async RequestSegment(index: number, audioTrackIndex: number): Promise<Buffer> {
    // return Buffer.alloc(0);
    if (index < this.startIndex || index >= this.startIndex + 3 || audioTrackIndex != this.currentTrack || this.startIndex == -1) {
      this.StartFfmpeg(index, audioTrackIndex);
    }
    return new Promise((resolve, reject) => {
      this.on.once(`segment-${index}-${audioTrackIndex}`, (segment) => {
        // console.log("segment", segment);
      });
    });
  }

  StartFfmpeg(index: number, trackIndex: number) {
    this.startIndex = index;
    this.currentTrack = trackIndex;
    if (this.process) this.process.kill();
    this.process = cp.spawn(`${get_ffmpeg_path()}`, [
      "-ss",
      index.toString(),
      "-i",
      this.filePath,
      "-sn",
      "-copyts",
      "-sc_threshold",
      "0",
      "-preset",
      "ultrafast",
      "-tune",
      "zero-latency",
      "-pix_fmt",
      "yuv420p",
      "-profile:v",
      "baseline",
      "-c:v",
      "libx264",
      "-c:a",
      "libmp3lame",
      "-map_metadata",
      "-1",
      "-force_key_frames",
      `expr:gte(t,n_forced*${TranscoderUtilisateur.hls_time})`,
      "-threads",
      "1",
      "-r",
      "30",
      "-crf",
      "23",
      "-map",
      "0:v:0",
      "-map",
      `0:a:${trackIndex}`,
      "-b:a",
      "128k",
      "-f",
      "segment",
      "-segment_delta_time",
      "0.1",
      "-segment_format",
      "mpegts",
      "-segment_list",
      "pipe:1",
      "-segment_start_number",
      index.toString(),
      "-movflags",
      "+faststart",
      get_hls_path() + "segment-%d.ts",
    ]);
    this.process.stdout!.on("data", (data) => {
      // console.log(data.toString());
      const str = data.toString();
    });
    this.process.stderr!.on("data", (data) => {
      // console.log(data.toString());
      const segment = data.toString();
      const reg = /segment\:(\d+)\.ts/g;
      const match = reg.exec(segment);
      if (match) {
        this.currentSegment = parseInt(match[1]);
        this.on.emit(`segment-${this.currentSegment}-${trackIndex}`);
      } else {
        console.log(segment, "not found as segment");
      }
    });
    this.process.on("close", (code) => {
      console.log("ffmpeg closed", code);
    });
  }

  GetFfprobeData(): Promise<FFPROBE_DATA> {
    return new Promise((resolve, reject) => {
      const pc = cp.spawn(`${get_ffprobe_path()}`, ["-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", this.filePath]);
      var data = "";
      pc.stdout.on("data", (d) => {
        data += d;
      });
      pc.stderr.on("data", (d) => {
        console.log(d.toString());
      });
      pc.on("close", (code) => {
        if (code !== 0) {
          console.log(code, get_ffprobe_path());
          reject("Failed to get ffprobe data");
          return;
        }
        const parsed: FFPROBE_DATA = JSON.parse(data);
        this.ffprobe = parsed;
        this.Length = parseFloat(parsed.format.duration);
        resolve(parsed);
        // resolve(JSON.parse(data));
      });
    });
  }
  buildManifest(): string {
    var manifest = [
      "#EXTM3U",
      "#EXT-X-VERSION:3",
      "#EXT-X-TARGETDURATION:" + (TranscoderUtilisateur.hls_time + 1).toString(),
      "#EXT-X-MEDIA-SEQUENCE:0",
      "#EXT-X-PLAYLIST-TYPE:VOD",
    ];
    for (let i = 0; i < this.Length; i += TranscoderUtilisateur.hls_time) {
      manifest.push("#EXTINF:" + TranscoderUtilisateur.hls_time + ",");
      manifest.push("http://localhost:8080/segment-" + i + ".ts");
    }
    manifest.push("#EXT-X-ENDLIST");
    // console.log(manifest.join("\n"));
    return manifest.join("\n");
  }
  destroy() {}
}

export class ElectronHlsLoader extends Hls.DefaultConfig.loader {
  constructor(config: any) {
    super(config);
    const load = this.load.bind(this);
    const abord = this.abort.bind(this);
    const destroy = this.destroy.bind(this);
    this.load = function (context: any, config: any, callbacks: any) {
      console.log(context);
      if (context.url == "m3u8") {
        const get = Transcode;
        if (!get) throw new Error("Transcode not found");
        console.log("loading m3u8");
        console.log(callbacks);
        var text = get.buildManifest();
        const response = {
          url: context.url,
          data: Buffer.from(text),
          code: 200,
          text: text,
        };
        const stats = {
          aborded: false,
          loaded: text.length,
          retry: 0,
          chunkCount: 1,
          bwEstimate: 0,
          loading: {
            start: 0,
            first: 0,
            end: 0,
            loaded: text.length,
          },
          parsing: {
            start: 0,
            end: 0,
            loaded: text.length,
          },
          buffering: {
            start: 0,
            end: 0,
            loaded: text.length,
          },
        };
        callbacks.onSuccess(response, stats, context, null);
      }
    };

    this.abort = function () {
      console.log("abord");
    };
    this.destroy = function () {
      console.log("destroy");
    };
  }
}

export async function electron_get_transcode_data(uri: string): Promise<TranscodeDATA> {
  const Url = new URL(uri);
  if (!Url.searchParams.get("file")) {
    console.log("no file param");
    return get_transcode_data(uri);
  }
  if (!Url.searchParams.get("type")) {
    console.log("no type param");
    return get_transcode_data(uri);
  }
  const fileId = parseInt(Url.searchParams.get("file") as string);
  if (!electron_has_file(fileId)) {
    console.log("File not found", fileId);
    return get_transcode_data(uri);
  }
  const file = CacheManager.GetFile(fileId);
  if (!file) throw new Error("File not found");
  var item_data = CacheManager.GetItemThroughtFile(fileId);
  if (!item_data) throw new Error("Item not found");
  const transcode = new TranscoderUtilisateur(fileId, GetDownloadPath() + get_file_name(item_data.File.ID));
  const data = await transcode.GetFfprobeData();
  var transcode_data: TranscodeDATA = {
    uuid: "",
    qualitys: [],
    tracks: [],
    subtitles: [],
    download_url: "",
    manifest: "m3u8",
    task_id: "",
    current: 0,
    total: 0,
    name: "",
    poster: "",
    backdrop: "",
    isLive: false,
    unload: (hls: Hls) => {
      hls.destroy();
      transcode.destroy();
    },
    create_hls: (
      videoElement: HTMLVideoElement,
      get_current_playback: () => {
        trackIndex: number;
        currentQualityName: string;
        currentTime: string;
      }
    ) => {
      console.log("create hls");
      const hls = new Hls({
        startPosition: 0,
      });
      hls.config.loader = ElectronHlsLoader;
      hls.loadSource("m3u8");
      hls.attachMedia(videoElement);

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.log("electronjs loader error");
        console.log(event, data);
      });
      videoElement.play();
      return hls;
    },
  };
  console.log(data);
  if (item_data?.File.CURRENT) {
    transcode_data.current = item_data.File.CURRENT;
  }

  return transcode_data;
}

export interface TranscodeDATA {
  uuid: string;
  qualitys: QUALITY[];
  tracks: Track[];
  subtitles: Subtitle[];
  download_url: string;
  manifest: string;
  task_id: string;
  current: number;
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

function get_ffprobe_path() {
  return "C:/ffprobe.exe";
}

function get_ffmpeg_path() {
  return "C:/ffmpeg.exe";
}
