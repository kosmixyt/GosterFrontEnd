import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { app_url } from ".";
import { toast } from "react-toastify";
import bencode from "bencode";
import { Buffer as bufff } from "buffer";
import { SearchClass, SearchRender } from "./search/search";
import { SKINNY_RENDER } from "./component/poster";
import { MovieItem, SEASON, TVItem } from "./render/render";
import { ToolTip } from "./component/tooptip/tooltip";
import { IoIosCloseCircle } from "react-icons/io";
import { createPortal } from "react-dom";
import { PlatformManager } from "./cordova/platform";

export function bytesToSize(bytes: number, decimals = 2) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(decimals)) + " " + sizes[i];
}

var skinny_peer = {
  adress: "82.65.99.194:10010",
  id: 0,
  download_speed: 1000000,
};
export var skinny_file = {
  name: "Ubuntu 20.04.iso",
  path: ".",
  size: 2000000000,
  progress: 0.5,
  priority: 1,
};
export interface TorrentItem {
  id: number;
  name: string;
  size: number;
  peers: number;
  paused: boolean;
  maxpeers: number;
  mediaOutput: "tv" | "movie";
  files: (typeof skinny_file)[];
  status: "download" | "upload";
  totalDownloaded: number;
  totalUploaded: number;
  mediaOutputUuid: string;
  progress: number;
  added: number;
  SKINNY: SKINNY_RENDER;
}
var skinny_torrent = {
  id: 0,
  name: "Ubuntu 20.04",
  time_to_1_percent: 0,
  size: 2000000000,
  paused: false,
  progress: 0.5,
  peers: [skinny_peer],
  maxpeers: 100,
  magnet: "magnet:?xt",
  mediaoutput: "tv",
  chunk_size: 1000000,
  chunk_count: 100,
  session_total_downloaded: 1000000,
  session_total_uploaded: 1000000,
  total_downloaded: 1000000,
  dl_path: "/home/alex/torrents",
  comment: "Ubuntu 20.04 comment",
  total_uploaded: 1000000,
  hash: "Ubuntu 20.04 hash",
  announce: ["http://tracker.debian.org:80"],
  media_output_uuid: "db@10",
  added: Date.now(),
  files: [skinny_file],
  creator: "Debian",
  creation_date: Date.now(),
  completed: false,
  seeding: false,
};

export default function Torrent() {
  return (
    <DropArea>
      <DisplayList />
    </DropArea>
  );
}

function DisplayList() {
  const [torrents, setTorrents] = useState([]);
  const [addModal, setAddModal] = useState(false);
  useEffect(() => {
    const event = new EventSource(`${app_url}/torrents/list`, {
      withCredentials: true,
    });
    event.addEventListener("torrents", (data) => setTorrents(JSON.parse(data.data)));
    event.addEventListener("error", (e) => toast.error("Erreur lors de la récupération des torrents"));
    return () => {
      event.close();
    };
  }, []);
  return (
    <div className="mt-12 ml-4">
      {addModal ? <AddModal close={() => setAddModal(false)} /> : <></>}
      <div className="text-center text-4xl underline">Vos Torrents</div>
      <div onClick={() => setAddModal(!addModal)} className="text-center">
        Ajouter
      </div>
      <table className="w-full min-w-96">
        <thead className="">
          <tr>
            <th>Name</th>
            <th>Progress</th>
            <th>Total Size</th>
            <th>DLED</th>
            <th>UPED</th>
            <th>Peers</th>
            <th>Type</th>
            <th>Media</th>
            <th>Added</th>
            <th>Zip</th>
            <th>.torrent</th>
            <th>Pause</th>
          </tr>
        </thead>
        <tbody className="border-collapse border-spacing-10 text-sm">
          {torrents.map((torrent, i) => (
            <RenderLineArray key={i} torrent={torrent} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RenderLineArray(props: { torrent: TorrentItem }) {
  const nav = useNavigate();
  const [deleted, setDeleted] = useState(false);
  const [showed, setshowed] = useState<{
    accordion: boolean;
    data: null | typeof skinny_torrent;
    showpeers: boolean;
    showAnnounce: boolean;
    tooltip: boolean;
    moveTargetStorage: boolean;
  }>({
    accordion: false,
    data: null,
    showpeers: false,
    showAnnounce: false,
    tooltip: false,
    moveTargetStorage: false,
  });
  useEffect(() => {
    if (showed.accordion) {
      const refresh = () => {
        if (showed.moveTargetStorage) return;
        fetch(`${app_url}/torrents/info?id=${props.torrent.id}`, {
          credentials: "include",
        })
          .then((res) => {
            if (res.status === 401) return nav("/login?redirect=/torrents");
            return res.json();
          })
          .then((data) => setshowed((e) => ({ ...e, data: data })));
      };
      refresh();
      const i = setInterval(refresh, 1000);
      return () => clearInterval(i);
    }
  }, [showed.accordion]);
  if (deleted) return <></>;
  return (
    <>
      <tr className="mt-4 hover:bg-gray-600 rounded-lg" onClick={() => setshowed({ ...showed, accordion: !showed.accordion })}>
        <td className="cursor-pointer">{props.torrent.name}</td>
        <td>
          <progress value={props.torrent.progress * 100} max={100}></progress>
        </td>
        <td>{bytesToSize(props.torrent.size)}</td>
        <td>{bytesToSize(props.torrent.totalDownloaded)}</td>
        <td>{bytesToSize(props.torrent.totalUploaded)}</td>
        <td>
          {props.torrent.peers}/{props.torrent.maxpeers}
        </td>
        <td>{props.torrent.mediaOutput}</td>
        <td className="cursor-pointer" onClick={() => nav(`/render/${props.torrent.mediaOutput}/${props.torrent.mediaOutputUuid}`)}>
          {props.torrent.mediaOutputUuid}
        </td>
        <td>{new Date(props.torrent.added).toLocaleString()}</td>
        <td onMouseEnter={() => setshowed({ ...showed, tooltip: true })} onMouseLeave={() => setshowed({ ...showed, tooltip: false })}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              document.location.href = `${app_url}/torrents/zip?id=${props.torrent.id}`;
            }}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Zip
          </button>
          <ToolTip text="Télécharger le dossier compressé" show={showed.tooltip}>
            <div onClick={() => setshowed({ ...showed, moveTargetStorage: true })}>Move Target Storage</div>
            <div
              onClick={(e) => {
                fetch(`${app_url}/torrents/action?id=${props.torrent.id}&action=recheck`, {
                  credentials: "include",
                })
                  .then((e) => e.json())
                  .then((e) => toast.info(e.status));
              }}
            >
              Validate data
            </div>
            <div
              onClick={(e) => {
                fetch(`${app_url}/torrents/action?id=${props.torrent.id}&action=download`, {
                  credentials: "include",
                })
                  .then((e) => e.json())
                  .then((e) => {
                    if (e.error) {
                      return toast.error(e.error);
                    }
                    toast.info(e.success);
                  });
              }}
            >
              Download
            </div>
            <div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Supprimer le torrent")) {
                    fetch(`${app_url}/torrents/action?id=${props.torrent.id}&action=delete&deleteFiles=${confirm("Supprimer les fichiers")}`, {
                      credentials: "include",
                    })
                      .then((e) => e.json())
                      .then((e) => {
                        if (e.error) {
                          return toast.error(e.error);
                        }
                        setDeleted(true);
                        toast.info(e.success);
                      });
                  }
                }}
              >
                Delete
              </button>
            </div>
          </ToolTip>
          {showed.moveTargetStorage ? (
            <MoveTargetStorage
              item={props.torrent as TorrentItem}
              oncancel={() => {
                setshowed({
                  ...showed,
                  moveTargetStorage: false,
                  tooltip: false,
                });
              }}
              show={showed.moveTargetStorage}
            />
          ) : (
            <></>
          )}
        </td>
        <td>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={(e) => {
              e.stopPropagation();
              document.location.href = `${app_url}/torrents/.torrent?id=${props.torrent.id}`;
            }}
          >
            .torrent
          </button>
        </td>
        <td>
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={(e) => {
              e.stopPropagation();
              fetch(`${app_url}/torrents/action?action=${props.torrent.paused ? "resume" : "pause"}&id=${props.torrent.id}`, {
                credentials: "include",
              })
                .then((e) => e.json())
                .then((e) => toast.info(e.status));
            }}
          >
            {props.torrent.paused ? "Resume" : "Pause"}
          </button>
        </td>
      </tr>
      {showed.data != null ? (
        <tr hidden={!showed.accordion}>
          <td colSpan={14}>
            <div className="flex">
              <div className="w-3/12 text-left">
                <div className="text-center">Download Info</div>
                <div>
                  <div onClick={() => setshowed({ ...showed, showpeers: !showed.showpeers })}>
                    <div>
                      {showed.data.peers.length} Peers (click to {showed.showpeers ? "hide" : "show"})
                    </div>
                    <div hidden={!showed.showpeers} className="ml-4">
                      {showed.data.peers.map((peer) => {
                        return (
                          <div>
                            <div onClick={() => window.open("https://ip-api.com/#" + peer.adress.split(":")[0])}>Adress : {peer.adress}</div>
                            <div>Dl : {bytesToSize(peer.download_speed)}/s</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div></div>
                </div>
                <div>
                  Downloaded : {showed.data?.total_downloaded} ({bytesToSize(showed.data?.total_downloaded)}) (
                  {bytesToSize(showed.data.session_total_downloaded)} this session)
                </div>
                <div>Time to 1% : {Math.round(showed.data?.time_to_1_percent)}s</div>
                <div>
                  Uploaded : {showed.data.total_uploaded} ({bytesToSize(showed.data.total_uploaded)}) (
                  {bytesToSize(showed.data.session_total_uploaded)} this session)
                </div>
                <div>
                  Progression : <progress value={showed.data.progress * 100} max={100}></progress>
                </div>
                <div>Ratio : {showed.data.total_downloaded / showed.data.total_uploaded}</div>
                <div>En Partage : {showed.data.seeding ? "oui" : "non"}</div>
                <div>Fini : {showed.data.completed ? "oui" : "non"}</div>
                <div>Type de Média de Sortie : {showed.data.mediaoutput.toString()}</div>
                <div>
                  Média de sortie : &nbsp;
                  <button onClick={() => nav(`/render/${showed.data!.mediaoutput}/${showed.data!.media_output_uuid}`)}>
                    {showed.data.media_output_uuid}
                  </button>
                </div>
              </div>
              <div className="w-3/12 text-left text-sm">
                <div className="text-center">Torrent Info</div>
                <div>Dl Path : {showed.data.dl_path}</div>
                <div onClick={() => setshowed({ ...showed, showAnnounce: !showed.showAnnounce })}>
                  <div>
                    {showed.data?.announce.length} Announce url (click to {showed.showAnnounce ? "hide" : "show"})
                  </div>
                  <div hidden={!showed.showAnnounce} className="ml-4">
                    {showed.data?.announce.map((e) => (
                      <div>{e}</div>
                    ))}
                  </div>
                </div>
                <div>
                  Size : {showed.data.size} ({bytesToSize(showed.data.size)})
                </div>
                <div>Hash : {showed.data.hash}</div>
                <div>
                  Magnet :{" "}
                  <a target="_blank" rel="noreferrer" href={showed.data.magnet}>
                    Link
                  </a>
                </div>
                <div>Creator : {showed.data.creator}</div>
                <div>Date De creation {new Date(showed.data.creation_date).toLocaleDateString()}</div>
                <div>Commentaire : {showed.data.comment}</div>
                <div>Ajouté le {new Date(showed.data.added * 1000).toLocaleDateString()}</div>
                <div>
                  Pieces : {showed.data.chunk_count} x {bytesToSize(showed.data.chunk_size).split(" ").join("")}
                </div>
              </div>
              <div className="w-6/12 text-left">
                <div className="text-center">Fichiers</div>
                <div className="overflow-auto max-h-full">
                  <table>
                    <thead className="text-center">
                      <th>Index</th>
                      <th>Progress</th>
                      <th>Priority</th>
                      <th>Nom</th>
                      <th>Taille</th>
                    </thead>
                    <tbody className="border-collapse border-spacing-10 text-sm">
                      {showed.data.files.map((file, i) => {
                        return (
                          <tr
                            onClick={(e) => {
                              e.stopPropagation();
                              document.location.href = `${app_url}/torrents/file?id=${showed.data!.id}&index=${i}`;
                            }}
                            className="hover:bg-slate-500 cursor-pointer"
                          >
                            <td>{i}</td>
                            <td>{file.progress * 100}%</td>
                            <td>{file.priority}</td>
                            <td>{file.name}</td>
                            <td>{bytesToSize(file.size)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </td>
        </tr>
      ) : (
        <></>
      )}
    </>
  );
}
function DropArea(props: { children: React.ReactNode }) {
  const [metadata, setmetadata] = useState<ReturnType<typeof ParseBencode> | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [itemType, setitemType] = useState<"tv" | "movie" | null>(null);
  var [item_selected, set_item_selected] = useState<MovieItem | TVItem | null>(null);
  const [season, setSeason] = useState<number | null>(null);
  const [res, setRes] = useState<null | any>(null);

  async function have_file(file: File) {
    setFile(file);
    const buf = await file.arrayBuffer();
    setmetadata(ParseBencode(buf));
    var item = null;
    while (item == null) {
      var t = prompt("(tv or movie)");
      if (t === "tv" || t === "movie") {
        item = t;
      }
    }
    setitemType(item as "tv" | "movie");
  }

  if (!metadata) {
    return (
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={async (e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          have_file(file);
        }}
        className=""
      >
        {props.children}
        <div className="w-full flex justify-center">
          <input
            type="file"
            onChange={(e) => {
              if (e.target.files) {
                have_file(e.target.files[0]);
              }
            }}
          />
        </div>
      </div>
    );
  }
  if (!item_selected) {
    var selected = false;
    return (
      <SearchRender
        headTitle={bufff.from(metadata.info.name.buffer).toString()}
        specificType={itemType as string}
        title={`Choisisser le ${itemType} à associer`}
        close={() => {
          if (!selected) {
            toast.info("Annulation de l'ajout du torrent");
            setmetadata(null);
            setitemType(null);
            set_item_selected(null);
          }
        }}
        onselect={(e, i) => {
          selected = true;
          //   set_item_selected(i);
          // GetItem(i.TYPE, i.ID).then((e) => {
          //   set_item_selected(e);
          // });
          PlatformManager.DispatchCache(i.ID.toString(), i.TYPE).then((e) => {
            set_item_selected(e);
          });
        }}
      />
    );
  }
  if (itemType === "tv" && season === null) {
    item_selected = item_selected as TVItem;
    return <SeasonSelector seasons={item_selected.SEASONS} onselect={setSeason} />;
  }
  if (file != null && item_selected != null && itemType != null && season != null) {
    if (itemType === "tv" && season == null) {
      throw new Error("Season is null");
    }
    console.log("post", file, itemType, item_selected, season);
    post_file_torrent(file, itemType, item_selected, season);
    document.location.reload();
  }

  return <div></div>;
}

function SeasonSelector(props: { seasons: SEASON[]; onselect: (index: number) => void }) {
  return (
    <div className={`h-full w-full fixed z-20 backdrop-blur-lg top-0 left-0 `}>
      <div className={`relative top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-stone-900 h-1/6 w-1/5 rounded-lg`}>
        <div className={`flex justify-center items-center flex-row`}>
          <div className="ml-4 mr-4 text-center mt-4 mb-4">
            <div className="text-3xl underline mb-5">Choisissez la saison</div>
            <div className="flex justify-center">
              {props.seasons.map((season, index) => (
                <button
                  className="ml-2 text-2xl hover:underline"
                  onClick={() => {
                    props.onselect(index);
                  }}
                >
                  {season}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function post_file_torrent(file: File | string, itemType: "tv" | "movie", item: MovieItem | TVItem, season_index: number) {
  const form = new FormData();
  console.log(file);
  if (file instanceof File) {
    form.append("file", file);
    form.append("addMethod", "manual");
  } else {
    form.append("addMethod", "search");
    form.append("torrentId", file);
  }
  form.append("mediaType", itemType);
  form.append("mediauuid", item.ID.toString());
  if (itemType === "tv") form.append("season_index", season_index.toString());

  console.log(FormData);
  fetch(`${app_url}/torrents/add`, {
    method: "POST",
    body: form,
    credentials: "include",
  }).then(async (res) => {
    if (res.status === 200) {
      toast.success("Torrent ajouté");
    } else {
      const c = await res.json();
      toast.error("Erreur lors de l'ajout du torrent" + c.error);
    }
  });
}

function ParseBencode(buf: ArrayBuffer): any {
  var result = bencode.decode(bufff.from(buf));
  return result;
}

export interface ParsedBencode {
  announce: string | string[];
  comment?: string;
  created_by: string;
  creation_date: number;
  encoding?: string;
  info: {
    piece_length: number;
    pieces: string;
    private: number;
    source?: string;
  } & (
    | {
        files: {
          length: number;
          path: string[];
        }[];
      }
    | {
        name: string;
        length: number;
      }
  );
}

export function GetStorages(): Promise<string[]> {
  return fetch(`${app_url}/torrents/storage`, {
    credentials: "include",
  })
    .then((e) => e.json())
    .then((e) => {
      return e.paths;
    });
}

function MoveTargetStorage(props: { item: TorrentItem; show: boolean; oncancel: () => void }) {
  const [availableStorage, setAvailableStorage] = useState<string[]>([]);
  const [target, setTarget] = useState("");
  console.log("render", target);
  useEffect(() => {
    GetStorages().then((e) => {
      setAvailableStorage(e);
      setTarget(e[0]);
    });
    document.body.classList.add("overflow-hidden");
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);
  return (
    <div onClick={(e) => e.stopPropagation()} className="h-full w-full fixed z-20 backdrop-blur-lg top-0 left-0">
      <div className="relative top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black w-3/4 min-w-[450px] h-5/6  rounded-lg flex-col flex justify-center">
        <div className="text-3xl p-4">Move Storage</div>
        <div className="flex justify-center items-center flex-row h-1/6">
          <div className="ml-4 mr-4 text-center mt-4 mb-4">
            <div className="justify-center">
              <div className="text-xl">New path For torrent : {props.item.name} : </div>
              <div className="flex items-center justify-center mt-4">
                <select value={target} onChange={(e) => setTarget(e.currentTarget.value)} className="rounded-lg text-2xl w-1/2 h-10">
                  {availableStorage.map((e) => (
                    <option value={e}>{e}</option>
                  ))}
                </select>
                <button
                  className="ml-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    props.oncancel();
                  }}
                >
                  <IoIosCloseCircle size={40} />
                </button>
              </div>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  const start = toast("Start Moving torrent", {
                    autoClose: false,
                  });
                  const eventSource = new EventSource(`${app_url}/torrents/move?torrent_id=${props.item.id}&target=${target}`, {
                    withCredentials: true,
                  });
                  eventSource.addEventListener("progress", (e) => {
                    toast.update(start, {
                      render: (parseFloat(e.data) * 100).toString() + "%",
                    });
                  });
                  eventSource.addEventListener("move", (e) => {
                    toast.update(start, { render: e.data });
                    eventSource.close();
                    props.oncancel();
                  });
                }}
              >
                Move
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export interface SearchResults {
  provider_name: string;
  id: string;
  name: string;
  link: string;
  seed: number;
  metadata: null | SearchResultsFiles[];
}
export interface SearchResultsFiles {
  size: number;
  files: {
    size: number;
    name: string;
    path: string;
  };
}

export function AddModal(props: {
  preload?: {
    finalType: "tv" | "movie";
    item: MovieItem | TVItem;
    season: number | null;
    search: string;
  };
  close: () => void;
}) {
  const [search, setSearch] = useState(props.preload?.search);
  const [results, setResults] = useState<SearchResults[]>([]);
  const [torrentId, setTorrentId] = useState<string | null>(null);
  const [finalType, setFinalType] = useState<"tv" | "movie" | null>(props.preload?.finalType ?? null);
  const [item, setItem] = useState<MovieItem | TVItem | null>(props.preload?.item ?? null);
  const searchButton = useRef<HTMLButtonElement>(null);
  const [season, setSeason] = useState<number | null>(props.preload?.season ?? null);
  useEffect(() => {
    if (item) {
      if ((season == null && finalType === "tv") || torrentId == null) {
        console.log("return");
        return;
      }
      console.log("post", item, season, finalType);
      post_file_torrent(torrentId as string, finalType as "tv" | "movie", item, season as number);
    }
  }, [item, season, finalType, torrentId]);
  useEffect(() => {
    if (props.preload?.search !== "" && props.preload?.search != null) {
      searchButton.current!.click();
    }
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "auto";
    };
  }, []);
  if (torrentId == null) {
    return (
      <div onClick={(e) => e.stopPropagation()} className="h-full w-full fixed z-20 backdrop-blur-lg top-0 left-0">
        <div className="relative top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#181818] w-3/4 min-w-[450px] h-5/6  rounded-lg flex-col flex justify-center">
          <div className="flex items-center justify-center mb-6 h-[7%]">
            <input className={`${SearchClass} mt-2 w-full`} value={search} onChange={(e) => setSearch(e.target.value)} />
            <button
              ref={searchButton}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2 ml-4"
              onClick={() => {
                searchButton.current!.disabled = true;
                fetch(`${app_url}/torrents/search?q=${search}`, {
                  credentials: "include",
                })
                  .then((e) => e.json())
                  .then((e) => {
                    console.log(e);
                    if (e.torrents.length === 0) {
                      toast.info("Aucun résultat trouvé");
                    }
                    setResults(e.torrents);
                    searchButton.current!.disabled = false;
                  });
              }}
            >
              Search
            </button>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-2 ml-4"
              onClick={() => {
                console.log("close");
                props.close();
              }}
            >
              Close
            </button>
          </div>
          <div className="h-[93%] min-w-96 overflow-auto w-full">
            <table className="w-full">
              <thead className="">
                <th>Provider</th>
                <th>Name</th>
                <th>Seed</th>
                <th>Link</th>
                <th>Download</th>
              </thead>
              <tbody className="text-sm overflow-auto">
                {results.map((result, i) => (
                  <tr className="h-12">
                    <td>{result.provider_name}</td>
                    <td>{result.name}</td>
                    <td>{result.seed}</td>
                    <td>
                      <a className="hover:underline cursor-pointer" target="_blank" rel="noreferrer" href={result.link}>
                        Link
                      </a>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setTorrentId(result.name);
                          console.log("set", result.id);
                        }}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
  if (finalType == null) {
    var fn = "";
    while (fn !== "tv" && fn !== "movie") {
      fn = prompt("Type de média (tv ou movie)") as string;
    }
    setFinalType(fn as "tv" | "movie");
    return <div></div>;
  }
  if (item == null) {
    return (
      <SearchRender
        title="Associer à Un Média"
        onselect={(e, i) => {
          e.stopPropagation();
          PlatformManager.DispatchCache(i.ID.toString(), i.TYPE).then(setItem);
        }}
        specificType={finalType as any}
        close={props.close}
      />
    );
  }
  if (finalType === "tv" && season === null) {
    return <SeasonSelector seasons={(item as TVItem).SEASONS} onselect={setSeason} />;
  }
  return <div>You Selected</div>;
}
