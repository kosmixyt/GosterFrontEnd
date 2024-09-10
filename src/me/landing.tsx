import { random } from "lodash";
import { bytesToSize, TorrentItem } from "../torrent";
import { app_url } from "..";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MiniDisplay } from "../component/minidisplaySquare/mini";
import { FileItem } from "../render/render";
import { Swiper, SwiperSlide } from "swiper/react";
import { SKINNY_RENDER } from "../component/poster";
import { BackDrop } from "../component/backdrop/backdrop";
import check from "./check.svg";
import { toast } from "react-toastify";
import close from "../requests/close.svg";
import { createPortal } from "react-dom";
import { Modal } from "../player/player";
import dl from "./download.gif";
import { FaCloudDownloadAlt, FaCloudUploadAlt } from "react-icons/fa";
import { IoIosMore } from "react-icons/io";
import { isMobile } from "react-device-detect";
export function UserLanding() {
  const [me, setMe] = useState<Me | undefined>(undefined);
  const nav = useNavigate();
  useEffect(() => {
    document.body.style.overflowX = "hidden";

    fetch(`${app_url}/me`, { credentials: "include" }).then((res) => res.json().then(setMe));
    return () => {
      document.body.style.overflowX = "auto";
    };
  }, []);
  if (!me) return <div>Loading...</div>;
  return (
    <div className="h-full w-full min-h-screen ">
      <div className="text-3xl text-center mt-4 font-semibold font-roboto">
        Bienvenue {me.username} | {me.current_upload_number}/{me.allowed_upload_number} uploads
      </div>
      <div className="flex justify-center mt-6">
        <div className="text-center text-2xl w-48 rounded-lg">
          <div className="font-semibold">Upload</div>
          <div className="font-semibold">{bytesToSize(me.current_upload_size) + "/" + bytesToSize(me.allowed_upload_size)}</div>
        </div>
      </div>
      <div className="font-semibold text-2xl  ml-4">Requete de téléchargement</div>

      <Swiper slidesPerView={isMobile ? 1 : "auto"}>
        {me.requests.map((req, i) => {
          return (
            <SwiperSlide
              onClick={() => nav(`/render/${req.Media_Type}/${req.Media_ID}`)}
              key={req.ID}
              style={{ width: "fit-content", marginLeft: `${i === 0 ? "40px" : "0px"}` }}
              className="flex justify-center cursor-pointer"
            >
              <div
                style={{ background: "linear-gradient(rgba(0,0,0,.7), rgba(0,0,0,.9)), url(" + req.Render.BACKDROP + ")" }}
                className="xl:w-[400px] xl:h-[225px] w-[180px] h-[150px] flex justify-center items-center  transition-transform hover:scale-105 rounded-lg p-4 m-4 bg-cover bg-center"
              >
                <div className="w-full hidden lg:flex justify-center">
                  <img src={req.Render.POSTER} alt="" className="h-auto w-24 transition-transform hover:scale-105   mt-1 mb-1 rounded-lg" />
                </div>
                <div>
                  <div className="text-xl font-semibold">{req.Render.NAME}</div>
                  <div className="opacity-35">Checked {40} sec ago</div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
      <div hidden={me.Torrents.length == 0} className="ml-4 font-semibold text-2xl">
        Torrents
      </div>
      <div className="p-4">
        <Swiper spaceBetween={"30px"} slidesPerView={isMobile ? 1 : "auto"}>
          {me.Torrents.map((torrent, i) => {
            return (
              <SwiperSlide style={{ width: "fit-content", marginLeft: `${i === 0 ? "40px" : "0px"} ` }}>
                <TorrentItemRender torrent={torrent} />
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
}

function Multiplicate(t: TorrentItem): TorrentItem {
  for (let i = 0; i < 4; i++) {
    // res.push(t);
    t.files.push(t.files[0]);
  }

  return t;
}

interface Me {
  id: number;
  username: string;
  requests: MeRequest[];
  Notifications: MeNotification[];
  allowed_upload_number: number;
  current_upload_number: number;
  allowed_upload_size: number;
  current_upload_size: number;
  allowed_transcode: number;
  current_transcode: number;
  shares: Me_Share[];
  Torrents: TorrentItem[];
}

interface MeNotification {
  ID: number;
  Message: string;
}

interface MeRequest {
  ID: number;
  Created: number;
  Type: string;
  Status: string;
  Last_Update: number;
  MaxSize: number;
  Interval: number;
  Media_Name: string;
  Media_Type: string;
  Media_ID: string;
  Torrent_ID: number;
  Torrent_Name: string;
  Render: SKINNY_RENDER;
}

type Me_Share = {
  ID: number;
  EXPIRE: Date;
  FILE: FileItem;
  MEDIA_TYPE: string;
  MEDIA_ID: string;
};

async function DeleteRequest(id: string) {
  const bd = await fetch(`${app_url}/request/remove?id=${id}`, { credentials: "include" });
  if (bd.ok) {
    toast.success("Request deleted");
  } else {
    toast.error("Request not deleted");
  }
}
async function DeleteShare(id: string) {
  const bd = await fetch(`${app_url}/share/remove?id=${id}`, { credentials: "include" });
  if (bd.ok) {
    toast.success("Share deleted");
  } else {
    toast.error("Share not deleted");
  }
}
async function CreateShare(fileId: string): Promise<{ id: number; expire: Date }> {
  const bd = await fetch(`${app_url}/share/add?id=${fileId}`, { credentials: "include" });
  if (bd.ok) {
    toast.success("Share created");
  } else {
    toast.error("Share not created");
  }
  var bo = await bd.json();

  if (bo.status === "error") {
    toast.error(bo.error);
    return { id: 0, expire: new Date() };
  }
  bo = bo.share;
  return { id: bo.id, expire: bo.expire };
}
export function ShareModal(props: { file_item: FileItem; close: () => void }) {
  const [expire, setExpire] = useState(new Date());
  const [id, setId] = useState(0);
  useEffect(() => {
    CreateShare(props.file_item.ID.toString()).then((e) => {
      setId(e.id);
      setExpire(new Date(e.expire));
    });
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "auto";
    };
  }, []);
  if (id == 0) return <div>Loading...</div>;
  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black opacity-50"></div>
      <div className="fixed z-10  rounded-lg p-4 bg-[#181818] flex flex-col w-1/4 justify-center">
        <div className="text-2xl font-semibold">Nouveau partage</div>
        <div className="text-xs opacity-50">Lorsque le fichier sera partagé il sera disponible pour une durée de 24h</div>
        <input type="text" value={`${app_url}/share/get?id=${id}`} readOnly />
        <div className="text-xs text-center opacity-50">Expire: {expire.toLocaleString()}</div>
        <div
          onClick={() => {
            props.close();
          }}
          className="text-center mt-2"
        >
          Fermer
        </div>
      </div>
    </div>,
    document.body
  );
}
async function ActionTorrent(id: number, action: string) {
  const data = await fetch(`${app_url}/torrents/action?id=${id}&action=${action}`, { credentials: "include" });
  if (data.ok) {
    toast.success(`Torrent ${action}d`);
  } else {
    toast.error(`Torrent not ${action}d`);
  }
  return data.ok;
}
export type TaskStatus = "ERROR" | "PENDING" | "RUNNING" | "FINISHED" | "CANCELLED";
interface ConvertProgress {
  SOURCE_FILE_ID: number;
  SOURCE_FILE_NAME: string;
  OUTPUT_FILE_NAME: string;
  TaskStatus: TaskStatus;
  TaskError: string;
  Task_id: number;
  Quality: string;
  AudioTrackIndex: number;
  Running: boolean;
  Progress: {
    Frame: number;
    Fps: number;
    Stream_0_0_q: number;
    Bitrate: number;
    Total_size: number;
    Out_time_us: number;
    Out_time_ms: number;
    Out_time: string;
    Dup_frames: number;
    Drop_frames: number;
    Speed: number;
    Progress: "progress" | "end";
    TotalProgress: number;
  };
  Start: number;
}

function TorrentItemRender(props: { torrent: TorrentItem }) {
  const nav = useNavigate();
  const [pause, setPause] = useState(props.torrent.paused);

  return (
    <div>
      <div
        style={{
          background: "linear-gradient(rgba(0,0,0,.7), rgba(0,0,0,.9)), url(" + props.torrent.SKINNY.BACKDROP + ")",
        }}
        className="bg-white 
        w-[200px] h-72
        md:w-[350px] md:h-52
        2xl:w-[450px] 2xl:h-64  
        rounded-lg cursor-pointer bg-cover  bg-center"
      >
        <div className="absolute h-full  w-full rounded-lg hover:opacity-100 hover:backdrop-blur-md transition-all opacity-0">
          <div className="p-2 gap-1  w-full h-full">
            <div className="flex justify-between">
              <div className="flex justify-center items-center gap-2">
                <div
                  onClick={() => window.open(`${app_url}/torrents/zip?id=${props.torrent.id}`)}
                  className="p-4 h-[40px] flex justify-center items-center bg-gray-900 text-white font-bold rounded-md  text-lg font-roboto"
                >
                  Zip
                </div>
                <div className="flex h-[40px] justify-center items-center bg-gray-900 p-4 rounded-lg">
                  <IoIosMore />
                </div>
              </div>
              <div
                onClick={() => {
                  ActionTorrent(props.torrent.id, pause ? "resume" : "pause").then((e) => {
                    if (e) setPause(!pause);
                  });
                }}
                className="flex gap-2"
              >
                <>
                  <div className="p-2 flex items-center ml-1 justify-center bg-gray-900 text-white font-bold rounded-lg ">
                    {Math.round(props.torrent.progress * 100)}%
                  </div>
                  {!isMobile && pause === false && (
                    <div className="p-2 hidden lg:flex items-center justify-center bg-gray-900 text-white font-bold rounded-lg ">
                      <div className="flex justify-center gap-2 items-center">
                        <FaCloudDownloadAlt />
                        {bytesToSize(props.torrent.totalDownloaded)}&nbsp;/&nbsp;
                      </div>
                      <div className="flex justify-center gap-2 items-center">
                        <FaCloudUploadAlt />
                        {bytesToSize(props.torrent.totalUploaded)}
                      </div>
                    </div>
                  )}

                  {pause && <div className="p-2 flex items-center justify-center bg-gray-900 text-white font-bold rounded-lg ">Paused</div>}
                </>
              </div>
            </div>
            <div className="overflow-auto max-h-[calc(100%-0.5rem-40px-0.25rem)] mt-1">
              {props.torrent.files.map((file, i) => (
                <div
                  onClick={() => {
                    // nav(`/render/${file.type}/${file.id}`);
                    window.open(`${app_url}/torrents/file?id=${props.torrent.id}&index=${i}`);
                  }}
                  className="w-full mt-1 rounded-lg bg-gray-900 text-white font-semibold text-sm 3xl:text-lg   overflow-hidden"
                >
                  <div>
                    <div className="text-center overflow-auto border-2 border-white p-1 lg:border-0 relative">
                      {Math.round(file.progress * 100)}% {file.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div
          onClick={() => {
            console.log("ccc");
          }}
          className="flex justify-center"
        >
          <img src={props.torrent.SKINNY.POSTER} alt="" className="h-auto w-32 mt-6 mb-2 rounded-lg" />
        </div>
        <div className="text-center font-semibold overflow-hidden ml-1 mr-1 text-xs lg:text-lg">{props.torrent.name}</div>
      </div>
    </div>
  );
}