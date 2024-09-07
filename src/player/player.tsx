import React, { useEffect } from "react";
import { NavigateFunction, Params, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { app_url } from "..";
import Hls from "hls.js";
import "./play.css";
import pause from "./icons/pause-svgrepo-com.svg";
import play from "./icons/play-svgrepo-com.svg";
import fullscren from "./icons/full-screen-svgrepo-com.svg";
import fullscreencircle from "./icons/full-screen-circle-svgrepo-com.svg";
import minimize from "./icons/minimize-square-2-svgrepo-com.svg";
import dl from "./icons/download-svgrepo-com.svg";
import close from "./icons/close-square-svgrepo-com.svg";
import pip from "./icons/pip-2-svgrepo-com.svg";
import settings from "./icons/settings-minimalistic-svgrepo-com.svg";
import { createPortal } from "react-dom";
import livestream from "./icons/play-stream-svgrepo-com.svg";
import unlock from "./icons/lock-keyhole-minimalistic-unlocked-svgrepo-com.svg";
import lock from "./icons/lock-keyhole-minimalistic-svgrepo-com.svg";
import { isMobile } from "react-device-detect";
import { DisplayTask } from "../component/taskdisplay/taskdisplay";
import { PlatformManager } from "../cordova/platform";
import { TranscodeDATA } from "../cordova/electron/electronTranscoder";
interface ProgressEvent {
  eventName: string;
  data: string;
}

export const PlayerRender = (props: {}) => {
  const params = useParams();
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [playerData, setPlayerData] = React.useState<TranscodeDATA | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  useEffect(() => {
    PlatformManager.DispatchTranscodeData(searchParams.get("transcode") ?? "")
      .then(setPlayerData)
      .catch(setError);
  }, []);
  if (error) return <div>{error}</div>;
  if (!playerData) return <div>Load</div>;
  return <NewPlayer data={playerData} nav={nav} params={params} />;
};

class NewPlayer extends React.Component<PlayerProps> {
  private video = React.createRef<HTMLVideoElement>();
  private Container = React.createRef<HTMLDivElement>();
  public Qualitys: QUALITY[] = this.props.data.qualitys;
  public Tracks: Track[] = this.props.data.tracks;
  //@ts-ignore
  public hls = null as Hls;
  public Subtitles: Subtitle[] = this.props.data.subtitles;
  public stats = {
    transfered: 0,
    chunk_transfered: 0,
    TtfbArr: [] as number[],
  };
  public state: {
    hideBottomBar: boolean;
    playing: boolean;
    fullscreen: boolean;
    currentTime: number;
    showDebugData: boolean;
    showSettings: boolean;
    currentQuality: QUALITY;
    currentTrack: Track;
    controlsLocked: boolean;
    currentSubtitle: Subtitle | null;
  } = {
    fullscreen: false,
    currentTime: 0,
    hideBottomBar: false,
    showDebugData: false,
    playing: false,
    currentQuality: this.Qualitys[0],
    controlsLocked: false,
    currentTrack: this.Tracks[0],
    showSettings: false,
    currentSubtitle: null,
  };
  constructor(props: PlayerProps) {
    super(props);
  }
  componentDidMount(): void {
    document.addEventListener("keydown", this.onkeydown.bind(this));
    console.log("mount", this.props.data.isBrowserPlayable);
    if (!this.props.data.isBrowserPlayable) {
      this.hls = this.props.data.create_hls(this.video.current!, () => {
        return {
          trackIndex: this.state.currentTrack.Index,
          currentQualityName: this.state.currentQuality.Name,
          currentTime: this.state.currentTime.toString(),
        };
      });
    } else {
      this.video.current!.src = this.props.data.manifest;
    }
  }
  shouldComponentUpdate(nextProps: Readonly<PlayerProps>, nextState: Readonly<{}>, nextContext: any): boolean {
    return true;
  }
  onkeydown(e: KeyboardEvent) {
    if (this.state.controlsLocked) return;
    switch (e.key) {
      case " ":
        this.playPause();
        break;
      case "ArrowRight":
        this.forward(null);
        break;
      case "ArrowLeft":
        this.backward(null);
        break;
    }
  }
  componentDidUpdate(prevProps: Readonly<PlayerProps>, prevState: Readonly<{}>, snapshot?: any): void {}
  componentWillUnmount(): void {
    document.removeEventListener("keydown", this.onkeydown.bind(this));
    if (!this.props.data.isBrowserPlayable) this.props.data.unload(this.hls);
  }
  GetCurrentIndex(): number {
    // hls_time = 2
    return Math.floor(this.state.currentTime / 2);
  }
  playPause() {
    console.log("click");
    if (this.video.current?.paused) this.video.current?.play();
    else this.video.current?.pause();
  }

  OpenSettings() {
    // document.exitFullscreen();
    this.setState({ showSettings: true });
    if (!this.video.current?.paused && !this.props.data.isLive) {
      this.video.current?.pause();
    }
  }
  fullScreen(e: React.MouseEvent<HTMLImageElement>) {
    if (this.state.fullscreen) {
      this.setState({ fullscreen: false });
      document.exitFullscreen();
    } else {
      document.body.requestFullscreen().then(() => {
        console.log("fullscreen");
        const handler = () => {
          if (!document.fullscreenElement) {
            this.setState({ fullscreen: false });
          }
        };
        document.addEventListener("fullscreenchange", handler);
        this.setState({ fullscreen: true });
      });
    }
  }
  init(sub: Subtitle | null) {
    for (let i = 0; i < this.video.current!.textTracks.length; i++) {
      // console.log(this.video.current!.textTracks[i].label, "hidden");
      this.video.current!.textTracks[i].mode = "disabled";
    }
    if (sub) {
      const track = this.video.current?.textTracks[sub.Index];
      track!.mode = "showing";
    }
  }
  public on_enter() {
    clearTimeout(this.HiddenTimeout!);
    this.setState({ hideBottomBar: false });
  }
  public HiddenTimeout: NodeJS.Timeout | null = null;
  public on_leave() {
    clearTimeout(this.HiddenTimeout!);
    this.setState({ hideBottomBar: false });
    this.HiddenTimeout = setTimeout(() => {
      console.log("hide");
      this.setState({ hideBottomBar: true });
    }, 2000);
  }

  Settings() {
    const closeSet = () => {
      this.setState({ showSettings: false });
      this.video.current?.play();
    };
    this.init(this.state.currentSubtitle);
    return createPortal(
      <Modal>
        <div className="w-96 h-48 rounded-lg">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-black w-full underline text-center">Settings</h1>
            <img src={close} alt="settings" onClick={closeSet} className="w-10 h-10 cursor-pointer" />
          </div>
          <div className="">
            <div className="flex mb-2">
              <div className="text-black ml-4">Qualité : </div>
              <select
                className="w-1/2 bg-transparent text-black"
                onChange={(e) => {
                  const index = parseInt(e.target.value);
                  this.setState({ currentQuality: this.Qualitys[index] });
                }}
                value={this.Qualitys.indexOf(this.state.currentQuality).toString()}
              >
                {this.Qualitys.map((quality, index) => {
                  return (
                    <option key={index} value={index}>
                      {quality.Name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="text-black ml-4" hidden={this.props.data.task_id === ""}>
              Show Debug Data : <button onClick={() => this.setState({ showDebugData: !this.state.showDebugData })}>Show/hide</button>
            </div>
            <div className="flex mb-2">
              <div className="text-black ml-4">Tracks : </div>
              <select
                className="w-1/2 bg-transparent text-black"
                onChange={(e) => {
                  const index = parseInt(e.target.value);
                  this.setState({ currentTrack: this.Tracks[index] });
                }}
                value={this.state.currentTrack.Index.toString()}
              >
                {this.Tracks.map((track) => {
                  return (
                    <option key={track.Index} value={track.Index}>
                      {track.Name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="flex">
              <div className="text-black ml-4">Subtitles : </div>
              <select
                className="w-1/2 bg-transparent text-black"
                onChange={(e) => {
                  const index = parseInt(e.target.value);
                  if (index === -1) {
                    this.setState({ currentSubtitle: null });
                    return;
                  }
                  this.setState({ currentSubtitle: this.Subtitles[index] });
                  this.init(this.state.currentSubtitle);
                }}
                value={this.state.currentSubtitle?.Index ?? -1}
              >
                {this.Subtitles.map((sub, index) => {
                  return (
                    <option key={index} value={sub.Index}>
                      {sub.Name}
                    </option>
                  );
                })}
                <option value="-1">None</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>,
      this.Container.current as HTMLDivElement
    );
  }
  setAtMax() {
    this.video.current!.currentTime = this.video.current!.duration;
  }
  backward(e: React.MouseEvent<HTMLDivElement> | null) {
    if (e) e.stopPropagation();
    var time = this.video.current!.currentTime - 10;
    this.video.current!.currentTime = time;
  }
  forward(e: React.MouseEvent<HTMLDivElement> | null) {
    if (e) e.stopPropagation();
    var time = this.video.current!.currentTime + 10;
    this.video.current!.currentTime = time;
  }

  render() {
    return (
      <div onMouseMove={this.on_leave.bind(this)} onMouseEnter={this.on_enter.bind(this)} onMouseLeave={this.on_leave.bind(this)} ref={this.Container}>
        <video
          onPlay={() => {
            this.setState({ playing: true });
          }}
          onPause={() => {
            this.setState({ playing: false });
          }}
          onTimeUpdate={(e) => this.setState({ currentTime: this.video.current?.currentTime ?? 0 })}
          autoPlay={true}
          className="w-screen h-screen absolute bg-black"
          crossOrigin="use-credentials"
          ref={this.video}
        >
          {this.Subtitles.map((sub) => {
            return (
              <track
                key={sub.Index}
                src={app_url + `/transcode/${this.props.data.uuid}/subtitle/${sub.Index}`}
                kind="subtitles"
                srcLang="fr"
                label={sub.Name}
              />
            );
          })}
        </video>
        <div
          onDoubleClick={(e) => {
            if (this.state.controlsLocked) return;
            this.fullScreen.bind(this);
          }}
          className="w-full h-full absolute  flex  items-center justify-center"
        >
          <div
            className="w-full h-full"
            onDoubleClick={(e) => {
              if (this.state.controlsLocked) return;
              this.backward(e);
            }}
          ></div>
          <div
            className="w-full h-full"
            onClick={(e) => {
              if (this.state.controlsLocked) return;
              this.playPause();
            }}
          ></div>
          <div
            className="w-full h-full flex items-center"
            onDoubleClick={(e) => {
              if (this.state.controlsLocked) return;
              this.forward.bind(this);
            }}
          >
            {this.state.showDebugData && <DisplayTask task_id={this.props.data.task_id} />}
          </div>
        </div>
        <div hidden={this.state.hideBottomBar} className="w-screen h-16 z-20  bottom-0 absolute flex  justify-between items-center">
          {this.state.controlsLocked && !this.state.hideBottomBar && (
            <div className="w-full flex justify-center">
              <img
                src={lock}
                onClick={() => this.setState({ controlsLocked: !this.state.controlsLocked })}
                alt="lock"
                className="w-14 h-14 pl-2 cursor-pointer"
              />
            </div>
          )}
          {!this.state.hideBottomBar && !this.state.controlsLocked && !isMobile && (
            <>
              <div>
                <img
                  onClick={this.playPause.bind(this)}
                  src={!this.video.current?.paused ? pause : play}
                  alt="pause"
                  className="cursor-pointer w-10 h-10 pl-2"
                />
              </div>
              <div className="flex w-[50%]">
                <input
                  className="w-full"
                  type="range"
                  min="0"
                  max={this.video.current?.duration || 0}
                  defaultValue={this.video.current?.currentTime ?? 0}
                  onChange={(e) => {
                    this.video.current!.currentTime = parseInt(e.target.value);
                  }}
                />
                <div
                  className="ml-2 font-bold
          text-blue-950
          text-xl
          "
                >
                  {this.props.data.isLive ? "🔴livestream🔴" : secondsToHms(this.video.current?.duration ?? 0)}
                </div>
              </div>
              <div className="flex">
                {this.state.showSettings ? this.Settings() : <></>}
                <img
                  src={pip}
                  hidden={isMobile}
                  onClick={() => {
                    this.video.current?.requestPictureInPicture();
                  }}
                  className="w-10 h-10 mr-2 cursor-pointer"
                />
                <img
                  src={this.state.controlsLocked ? lock : unlock}
                  onClick={() => this.setState({ controlsLocked: !this.state.controlsLocked })}
                  className="w-10 h-10 mr-2 cursor-pointer"
                />
                <img
                  src={this.props.data.isLive ? livestream : dl}
                  hidden={this.props.data.download_url === ""}
                  onClick={!this.props.data.isLive ? this.download.bind(this) : this.setAtMax.bind(this)}
                  alt="download"
                  className="hidden md:block  w-10 h-10 mr-2 cursor-pointer"
                />
                <img
                  src={settings}
                  onClick={this.OpenSettings.bind(this)}
                  alt="settings"
                  className="w-10 h-10 
                mr-2 
                cursor-pointer 
                hover:rotate-90 
                transition-[rotate] 
                hover:animate-zoomInNoDelay
                ease-in-out"
                />
                <img
                  src={this.state.fullscreen ? minimize : fullscreencircle}
                  onClick={(e) => this.fullScreen.bind(this)(e)}
                  alt="fullscren"
                  className="w-10 h-10 mr-2 cursor-pointer"
                />
              </div>
            </>
          )}

          {!this.state.hideBottomBar && !this.state.controlsLocked && isMobile && (
            <>
              <div>
                <img
                  onClick={(e) => {
                    this.playPause.bind(this);
                  }}
                  src={!this.video.current?.paused ? pause : play}
                  alt="pause"
                  className="cursor-pointer w-10 h-10 pl-2"
                />
              </div>
              <div className="flex w-[50%]">
                <input
                  className="w-full"
                  type="range"
                  min="0"
                  max={this.video.current?.duration || 0}
                  defaultValue={this.video.current?.currentTime ?? 0}
                  onChange={(e) => {
                    this.video.current!.currentTime = parseInt(e.target.value);
                  }}
                />
                <div
                  className="ml-2 font-bold
          text-blue-950
          text-xl
          "
                >
                  {this.props.data.isLive ? "🔴livestream🔴" : secondsToHms(this.video.current?.duration ?? 0)}
                </div>
              </div>
              <div className="flex">
                {this.state.showSettings ? this.Settings() : <></>}
                <img
                  src={pip}
                  hidden={isMobile}
                  onClick={() => {
                    this.video.current?.requestPictureInPicture();
                  }}
                  className="w-10 h-10 mr-2 cursor-pointer"
                />
                <img
                  src={this.state.controlsLocked ? lock : unlock}
                  onClick={() => this.setState({ controlsLocked: !this.state.controlsLocked })}
                  className="w-10 h-10 mr-2 cursor-pointer"
                />
                <img
                  src={this.props.data.isLive ? livestream : dl}
                  hidden={this.props.data.download_url === ""}
                  onClick={!this.props.data.isLive ? this.download.bind(this) : this.setAtMax.bind(this)}
                  alt="download"
                  className="hidden md:block  w-10 h-10 mr-2 cursor-pointer"
                />
                <img
                  src={settings}
                  onClick={this.OpenSettings.bind(this)}
                  alt="settings"
                  className="w-10 h-10 
                mr-2 
                cursor-pointer 
                hover:rotate-90 
                transition-[rotate] 
                hover:animate-zoomInNoDelay
                ease-in-out"
                />
                <img
                  src={this.state.fullscreen ? minimize : fullscreencircle}
                  onClick={(e) => this.fullScreen.bind(this)(e)}
                  alt="fullscren"
                  className="w-10 h-10 mr-2 cursor-pointer"
                />
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
  download() {
    console.log("download");
    window.open(this.props.data.download_url, "_blank");
  }
}
function secondsToHms(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
export interface PlayerProps {
  data: TranscodeDATA;
  params: Readonly<Params<string>>;
  nav: NavigateFunction;
}
export interface QUALITY {
  Name: string;
  Resolution: number;
  VideoBitrate: number;
  AudioBitrate: number;
}
export interface Subtitle {
  Index: number;
  Name: string;
}

export interface Track {
  Index: number;
  Name: string;
}
const SYNC = {
  BAR: "bar",
  VIDEO: "video",
};

export function Modal(props: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-screen z-40 fixed">
      <div className="h-full w-full bg-black bg-opacity-50"></div>
      <div className="bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg">{props.children}</div>
    </div>
  );
}
