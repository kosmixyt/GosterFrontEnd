import { app_url } from "..";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EPISODE, FileItem, TVItem } from "../render/render";
import checked from "./checked-svgrepo-com.svg";
import { Swiper, SwiperSlide } from "swiper/react";
import { SKINNY_RENDER } from "../component/poster";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import {
  FaArrowAltCircleRight,
  FaArrowCircleDown,
  FaCloudDownloadAlt,
  FaCloudUploadAlt,
} from "react-icons/fa";
import { isMobile } from "react-device-detect";
import { AdminCleanMovie } from "../metadata/dragger";
import { IoCloseCircleSharp } from "react-icons/io5";
import { IoMdArrowDropleftCircle } from "react-icons/io";
const get_me = async () => {
  const res = await fetch(`${app_url}/me`, { credentials: "include" });
  return await res.json();
};
export function UserLanding() {
  const [me, setMe] = useState<Me | undefined>(undefined);
  const nav = useNavigate();
  const [flexModeTorrent, setFlexModeTorrent] = useState(true);
  const [flexModeRequest, setFlexModeRequest] = useState(true);
  useEffect(() => {
    document.body.style.overflowY = "scroll";
    const inter = setInterval(() => {
      get_me().then(setMe);
    }, 1000);
    return () => {
      clearInterval(inter);
      document.body.style.overflowY = "auto";
    };
  }, []);
  if (!me) return <div></div>;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="h-full w-full min-h-screen mt-14"
    >
      <div className="text-3xl text-center mt-4 font-semibold font-roboto">
        Bienvenue {me.username}
      </div>
      <div className="flex justify-center">
        <div
          onClick={() => {
            fetch(`${app_url}/logout`, { credentials: "include" }).then(() => {
              nav("/login");
            });
          }}
          className="p-4 bg-gray-800 mt-3 hover:scale-105 transition-all text-lg font-semibold cursor-pointer rounded-lg text-white"
        >
          Logout
        </div>
      </div>
      <div className="md:flex justify-center">
        <div
          className={`w-1/5 min-w-56  h-24 rounded-lg m-4 ${
            me.current_transcode + 5 > me.allowed_transcode
              ? "bg-red-900"
              : "bg-slate-900"
          }  flex justify-center items-center text-3xl font-semibold`}
        >
          <div>
            <div className="text-center">
              {me.current_transcode}/{me.allowed_transcode}
            </div>
            <div className="text-lg opacity-50 text-center">
              Allowed Transcode
            </div>
          </div>
        </div>
        <div
          className={`w-1/5 min-w-56 h-24 rounded-lg m-4 ${
            me.current_upload_number + 5 > me.allowed_upload_number
              ? "bg-red-900"
              : "bg-slate-900"
          }  flex justify-center items-center text-3xl font-semibold`}
        >
          <div>
            <div className="text-center">
              {me.current_upload_number}/{me.allowed_upload_number}
            </div>
            <div className="text-lg opacity-50 text-center">Allowed Upload</div>
          </div>
        </div>
        <div
          className={`w-1/5 min-w-56  h-24 rounded-lg m-4 ${
            me.current_upload_size + 5 * 1_000_000_000 > me.allowed_upload_size
              ? "bg-red-900"
              : "bg-slate-900"
          }  flex justify-center items-center text-3xl font-semibold`}
        >
          <div>
            <div className="text-center">
              {bytesToSize(me.current_upload_size)}/
              {bytesToSize(me.allowed_upload_size)}
            </div>
            <div className="text-lg opacity-50 text-center">
              Allowed Upload Size
            </div>
          </div>
        </div>
      </div>
      <div
        hidden={me.Torrents.length == 0}
        className="ml-4 font-semibold text-2xl flex gap-4 items-center"
      >
        <div> Requete de téléchargement ({me.requests.length})</div>
        <div
          className="mt-2"
          onClick={() => setFlexModeRequest(!flexModeRequest)}
        >
          {flexModeRequest ? <FaArrowAltCircleRight /> : <FaArrowCircleDown />}
        </div>
      </div>
      {flexModeRequest && (
        <Swiper slidesPerView={isMobile ? 1 : "auto"}>
          {me.requests.map((req, i) => {
            return (
              <SwiperSlide
                key={req.ID}
                style={{
                  width: "fit-content",
                  marginLeft: `${i === 0 ? "40px" : "0px"}`,
                }}
                className="flex justify-center cursor-pointer"
              >
                <div
                  className=""
                  onClick={() =>
                    nav(`/render/${req.Media_Type}/${req.Media_ID}`)
                  }
                >
                  <RequestItem
                    refresh={() => get_me().then(setMe)}
                    item={req}
                  />
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      )}
      {!flexModeRequest && (
        <div className="flex flex-wrap justify-center gap-4">
          {me.requests.map((req, i) => {
            return (
              <div className="m-4">
                <RequestItem item={req} refresh={() => get_me().then(setMe)} />
              </div>
            );
          })}
        </div>
      )}
      <div
        hidden={me.Torrents.length == 0}
        className="ml-4 font-semibold text-2xl flex gap-4 items-center"
      >
        <div> Torrents ({me.Torrents.length})</div>
        <div
          className="mt-2"
          onClick={() => setFlexModeTorrent(!flexModeTorrent)}
        >
          {flexModeTorrent ? <FaArrowAltCircleRight /> : <FaArrowCircleDown />}
        </div>
      </div>
      <div className="p-4">
        {!flexModeTorrent && (
          <Swiper spaceBetween={"30px"} slidesPerView={isMobile ? 1 : "auto"}>
            {me.Torrents.map((torrent, i) => {
              return (
                <SwiperSlide
                  style={{
                    width: "fit-content",
                    marginLeft: `${i === 0 ? "40px" : "0px"} `,
                  }}
                >
                  <TorrentItemRender torrent={torrent} />
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}
        {flexModeTorrent && (
          <div className="flex flex-wrap justify-center gap-4">
            {me.Torrents.map((torrent, i) => {
              return (
                <div>
                  <TorrentItemRender torrent={torrent} />
                </div>
              );
            })}
          </div>
        )}
        <div className="text-3xl ml-1 font-bold">Admin Area</div>

        <div className="flex flex-wrap mt-4 gap-2">
          <div
            onClick={AdminCleanMovie}
            className="p-4 bg-gray-800 hover:scale-105 transition-all text-lg font-semibold cursor-pointer rounded-lg text-white"
          >
            Clean Orphelin Movies
          </div>
          <div
            onClick={() => nav("/dragger")}
            className="p-4 bg-gray-800 hover:scale-105 transition-all text-lg font-semibold cursor-pointer rounded-lg text-white"
          >
            Metadata Dragger
          </div>
          <div
            onClick={() => nav("/pty")}
            className="p-4 bg-gray-800 hover:scale-105 transition-all text-lg font-semibold cursor-pointer rounded-lg text-white"
          >
            PTY SHELL
          </div>
        </div>
      </div>
    </motion.div>
  );
}
function RequestItem(props: { item: MeRequest; refresh: () => void }) {
  const ended = props.item.Status == "finished";
  return (
    <motion.div
      style={{ scale: 1.01 }}
      whileHover={{ scale: 1.05 }}
      className="m-4 cursor-pointer group"
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          DeleteRequest(props.item.ID.toString()).then(() => {
            props.refresh();
          });
        }}
        className="absolute top-1 left-1 z-40"
      >
        <IoCloseCircleSharp
          size={25}
          className="opacity-0 group-hover:opacity-100 transition-all duration-300"
        />
      </div>
      <div
        style={{
          background:
            "linear-gradient(rgba(0,0,0,.7), rgba(0,0,0,.9)), url(" +
            props.item.Render.BACKDROP +
            ")",
        }}
        className="xl:w-[400px] xl:h-[225px] w-[180px] h-[150px] flex justify-center items-center  transition-transform rounded-lg p-4 bg-cover bg-center"
      >
        <div className="w-full hidden lg:flex justify-center">
          <img
            src={props.item.Render.POSTER}
            alt=""
            className="h-auto w-24 transition-transform hover:scale-105   mt-1 mb-1 rounded-lg"
          />
        </div>
        <div className={`ml-1 xl:ml-0 ${ended ? "hidden" : ""}`}>
          <div className="text-md xl:text-xl ml-1  font-semibold">
            {props.item.Render.NAME}
          </div>
          <div className="opacity-35 hidden xl:block">
            Checked {props.item.Last_Update} sec ago
          </div>
        </div>
        <div
          className={`w-full ${
            ended ? "" : "hidden"
          } h-full flex items-center justify-center bg-green-500  opacity-60 absolute  backdrop-opacity-50 rounded-lg`}
        >
          <img src={checked} alt="" className="h-24 w-24" />
        </div>
      </div>
    </motion.div>
  );
}

function Multiplicate<T>(t: T[]): T[] {
  for (let i = 0; i < 4; i++) {
    // res.push(t);
    t.push(t[0]);
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
  const bd = await fetch(`${app_url}/request/remove?id=${id}`, {
    credentials: "include",
  });
  if (bd.ok) {
    toast.success("Request deleted");
  } else {
    toast.error("Request not deleted");
  }
}
async function DeleteShare(id: string) {
  const bd = await fetch(`${app_url}/share/remove?id=${id}`, {
    credentials: "include",
  });
  if (bd.ok) {
    toast.success("Share deleted");
  } else {
    toast.error("Share not deleted");
  }
}
async function CreateShare(
  fileId: string
): Promise<{ id: number; expire: Date }> {
  const bd = await fetch(`${app_url}/share/add?id=${fileId}`, {
    credentials: "include",
  });
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
        <div className="text-xs opacity-50">
          Lorsque le fichier sera partagé il sera disponible pour une durée de
          24h
        </div>
        <input type="text" value={`${app_url}/share/get?id=${id}`} readOnly />
        <div className="text-xs text-center opacity-50">
          Expire: {expire.toLocaleString()}
        </div>
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
  const data = await fetch(
    `${app_url}/torrents/action?id=${id}&action=${action}`,
    { credentials: "include" }
  );
  const res = await data.json();
  if (data.ok) {
    toast.success(`Torrent ${action}d`);
  } else {
    toast.error(res.error);
  }
  return data.ok;
}
export type TaskStatus =
  | "ERROR"
  | "PENDING"
  | "RUNNING"
  | "FINISHED"
  | "CANCELLED";
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
  const [paused, setPaused] = useState(props.torrent.paused);
  const [showFiles, setShowFiles] = useState(false);
  const buttonStyle =
    "w-4/6 rounded-lg text-center bg-slate-900 text-white  text-lg m-1";
  return (
    <div>
      <div
        onClick={() => {
          nav(
            `/render/${props.torrent.SKINNY.TYPE}/${props.torrent.SKINNY.ID}`
          );
        }}
        style={{
          background:
            "linear-gradient(rgba(0,0,0,.7), rgba(0,0,0,.9)), url(" +
            props.torrent.SKINNY.BACKDROP +
            ")",
        }}
        className="bg-white 
        w-[200px] h-72
        md:w-[350px] md:h-52
        2xl:w-[450px] 2xl:h-64  
        relative
        rounded-lg cursor-pointer bg-cover  bg-center"
      >
        <div className="absolute top-1 left-1 p-1 bg-stone-900 font-bold rounded-lg">
          {bytesToSize(props.torrent.size)}
        </div>
        <div className="absolute top-1 right-1 p-1 bg-stone-900 font-bold rounded-lg">
          {Math.round(props.torrent.progress * 100) + "%"}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1, backdropFilter: "blur(20px)" }}
          className={`absolute h-full w-full rounded-lg z-[60]`}
          onClick={(e) => e.stopPropagation()}
        >
          {!showFiles && (
            <div className="w-full h-full pt-4 items-center flex flex-col overflow-auto no-scrollbar">
              <div
                onClick={() => {
                  document.location.href = `${app_url}/torrents/zip?id=${props.torrent.id}`;
                }}
                className={buttonStyle}
              >
                Zip
              </div>
              <div
                onClick={() => {
                  setShowFiles(true);
                }}
                className={buttonStyle}
              >
                Files
              </div>
              <div
                onClick={() => {
                  document.location.href = `${app_url}/torrents/.torrent?id=${props.torrent.id}`;
                }}
                className={buttonStyle}
              >
                Download .torrent
              </div>
              <div
                onClick={() => {
                  ActionTorrent(
                    props.torrent.id,
                    paused ? "resume" : "pause"
                  ).then((e) => {
                    if (e) {
                      setPaused(!paused);
                    }
                  });
                }}
                className={buttonStyle}
              >
                {paused ? "Resume" : "Pause"}
              </div>
              <div
                onClick={async () => {
                  if (!confirm("Are you sure to delete this torrent")) return;
                  const res = await fetch(
                    `${app_url}/torrents/action?id=${
                      props.torrent.id
                    }&action=delete&deleteFiles=${confirm("Delete files ?")}`,
                    { credentials: "include" }
                  );
                  const data = await res.json();
                  if (res.ok) {
                    toast.success("Torrent deleted");
                  } else {
                    toast.error(data.error);
                  }
                }}
                className={buttonStyle}
              >
                Delete
              </div>
              <div className="w-full text-center"></div>
              <div className="text-center bg-gray-700 w-4/6 rounded-md font-bold  mt-4">
                <div className="flex items-center justify-center gap-2">
                  <FaCloudDownloadAlt />
                  <div>{bytesToSize(props.torrent.totalDownloaded)}</div>
                  <FaCloudUploadAlt />
                  <div>{bytesToSize(props.torrent.totalUploaded)}</div>
                </div>
              </div>
            </div>
          )}
          {showFiles && (
            <div className="w-full h-full pt-4 items-center flex flex-col">
              <div
                onClick={() => {
                  setShowFiles(false);
                }}
                className={buttonStyle}
              >
                Back
              </div>
              <div className="w-full h-full overflow-y-auto flex flex-col items-center no-scrollbar">
                {props.torrent.files.map((file, i) => {
                  return (
                    <div
                      onClick={() => {
                        document.location.href = `${app_url}/torrents/file?id=${props.torrent.id}&index=${i}`;
                      }}
                      key={i}
                      className="bg-gray-800 max-w-[80%] rounded-lg mt-1 p-2 mb-1 flex gap-2"
                    >
                      <div className="break-words whitespace-normal max-w-[85%]">
                        {file.name}
                      </div>
                      <div className="max-w-[15%]">
                        {Math.round(file.progress * 100) + "%"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
        <div
          onClick={() => {
            console.log("ccc");
          }}
          className="flex justify-center"
        >
          <img
            src={props.torrent.SKINNY.POSTER}
            alt=""
            className="h-auto w-24 2xl:w-32 mt-6 mb-2 rounded-lg relative z-50"
          />
        </div>
        <div className="text-center font-semibold overflow-hidden ml-1 mr-1 text-xs xl:text-sm 2xl:text-lg absolute bottom-1 w-full leading-[4px]">
          {props.torrent.name.substring(0, 50)}
        </div>
      </div>
    </div>
  );
}

export function bytesToSize(bytes: number) {
  var sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes == 0) return "0 Byte";
  var i = parseInt(String(Math.floor(Math.log(bytes) / Math.log(1024))));
  return Math.round(bytes / Math.pow(1024, i)) + " " + sizes[i];
}
export interface TorrentItem {
  id: number;
  name: string;
  progress: number;
  paused: boolean;
  totalDownloaded: number;
  totalUploaded: number;
  size: number;
  files: {
    name: string;
    progress: number;
  }[];
  SKINNY: SKINNY_RENDER;
}
