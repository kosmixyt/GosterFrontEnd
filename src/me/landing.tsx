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
// export const Media_Request = [1, 2, 3, 4, 5, 6];

export function UserLanding() {
  const [me, setMe] = useState<Me | undefined>(undefined);
  const nav = useNavigate();
  useEffect(() => {
    fetch(`${app_url}/me`, { credentials: "include" }).then((res) => res.json().then(setMe));
  }, []);
  if (!me) return <div>Loading...</div>;
  return (
    <div className="flex flex-col justify-center mt-12 h-full">
      <div className="text-3xl text-center underline font-semibold">Me</div>
      <div className="font-semibold text-2xl ml-4 underline underline-offset-4">Requete de téléchargement</div>
      <Swiper slidesPerView={"auto"}>
        {me.requests.map((req) => {
          return (
            <SwiperSlide
              onClick={() => nav(`/render/${req.Media_Type}/${req.Media_ID}`)}
              key={req.ID}
              style={{ width: "fit-content" }}
              className="flex justify-center cursor-pointer"
            >
              <div className="flex flex-col min-w-96  bg-gray-800 rounded-lg p-4 m-4">
                <div className="items-center font-semibold underline flex justify-between">
                  <div>
                    <div className="text-lg">{req.Media_Name}</div>
                    <span className="opacity-50 text-sm"> {req.Status == "finished" ? "(" + req.Torrent_Name + ")" : ""}</span>
                  </div>
                  <img
                    onClick={(e) => {
                      e.stopPropagation();
                      DeleteRequest(req.ID.toString()).then(() => {
                        setMe({ ...me, requests: me.requests.filter((r) => r.ID !== req.ID) });
                      });
                    }}
                    src={req.Status !== "finished" ? close : check}
                    alt=""
                    className="w-6 h-6"
                  />
                </div>
                <img src={req.Render.BACKDROP} alt="" className="w-72 mt-2 mb-2 rounded-lg" />
                <div className="text-sm">Max Size: {bytesToSize(req.MaxSize)}</div>
                <div className="text-sm">Status: {req.Status}</div>
                <div className="text-sm">Last Update: {req.Last_Update}sec ago</div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
      <div hidden={me.requests.length == 0} className="font-semibold text-2xl ml-4 underline underline-offset-4">
        Shares
      </div>
      <Swiper slidesPerView={"auto"}>
        {me.shares.map((share) => {
          return (
            <SwiperSlide
              onClick={() => nav(`/render/${share.MEDIA_TYPE}/${share.MEDIA_ID}`)}
              key={share.ID}
              style={{ width: "fit-content" }}
              className="flex justify-center cursor-pointer"
            >
              <div className="flex flex-col min-w-96  bg-gray-800 rounded-lg p-4 m-4">
                <div className="items-center font-semibold underline flex justify-between">
                  <div>
                    <div className="text-lg">{share.FILE.FILENAME}</div>
                  </div>
                  <img
                    onClick={(e) => {
                      e.stopPropagation();
                      DeleteShare(share.ID.toString()).then(() => {
                        setMe({ ...me, shares: me.shares.filter((r) => r.ID !== share.ID) });
                      });
                    }}
                    src={close}
                    alt=""
                    className="w-6 h-6 ml-4"
                  />
                </div>
                <div className="text-sm">Size: {bytesToSize(share.FILE.SIZE)}</div>
                <div
                  onClick={() => {
                    document.location.href = `${app_url}/share/get?id=${share.ID}`;
                  }}
                  className="text-sm opacity-50"
                >
                  {app_url}/share/get?id={share.ID}
                </div>
                <div className="text-sm">Expire : {share.EXPIRE}</div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
      <div hidden={me.Torrents.length == 0} className="font-semibold text-2xl ml-4 underline underline-offset-4">
        Torrents
      </div>
      <Swiper slidesPerView={"auto"}>
        {me.Torrents.map((torrent) => {
          return (
            <SwiperSlide
              onClick={() => nav(`/render/${torrent.mediaOutput}/${torrent.mediaOutputUuid}`)}
              key={torrent.id}
              style={{ width: "fit-content" }}
              className="flex justify-center cursor-pointer"
            >
              <div className="flex flex-col min-w-96  bg-gray-800 rounded-lg p-4 m-4">
                <div className="items-center font-semibold underline flex justify-between">
                  <div>
                    <div className="text-lg">{torrent.name}</div>
                  </div>
                </div>
                {/* <img src={torrent.backdrop} alt="" className="w-72 mt-2 mb-2 rounded-lg" /> */}
                <div className="text-sm">Size: {bytesToSize(torrent.size)}</div>
                <div className="text-sm">Status: {torrent.status}</div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
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