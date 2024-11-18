import React, { useEffect, useState } from "react";
import { SetURLSearchParams, useLoaderData, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { GENRE, Porenderer, SKINNY_RENDER } from "../component/poster";
import { app_url } from "..";
import { BrowserView, isMobile, MobileView } from "react-device-detect";
import { Id, toast } from "react-toastify";
import { motion } from "framer-motion";
import react from "@vitejs/plugin-react-swc";
import { AddModal, post_file_torrent } from "../torrent";
import { Buffer } from "buffer";
import { createPortal } from "react-dom";
import unavailable from "./unavailable.png";
import { FaFileAlt, FaPlay } from "react-icons/fa";
import { SwiperSlide, Swiper } from "swiper/react";
import { PlatformManager } from "../cordova/platform";
import { BackDrop } from "../component/backdrop/backdrop";
import { ConvertModal } from "../convert/convert";
import { ChooseStorage } from "../component/choosestorage/choosestorage";
import { RequestModal } from "../requests/requests";
import { ShareModal } from "../me/landing";
import { CgUnavailable } from "react-icons/cg";
import { Loader } from "../component/loader/loader";

export const Render = (props: {}) => {
  const params = useParams();
  const navigate = useNavigate();
  const [item, setItem] = React.useState<null | MovieItem | TVItem>(null);
  useEffect(() => {
    if (item != null) {
      console.log("Item changed", item);
      setItem(null);
    }
    PlatformManager.DispatchCache(params.id ?? "any", params.type ?? "")
      .then((item) => {
        setItem(item);
      })
      .catch((e) => {
        console.error(e);
      });
  }, [params.type, params.id]);
  if (!item) return <Loader />;
  return <Renderer params={params} navigate={navigate} Item={item} />;
};
export interface RendereProps {
  params: any;
  navigate: any;
  Item: MovieItem | TVItem;
}
export interface WATCH_DATA {
  CURRENT: number;
  TOTAL: number;
}
export interface MovieItem {
  ID: string;
  DISPLAY_NAME: string;
  LOGO: string;
  YEAR: string;
  FILES: FileItem[];
  WATCH: WATCH_DATA;
  BUDGET: string;
  AWARDS: string;
  DIRECTOR: string;
  WRITER: string;
  TAGLINE: string;
  Vote_Average: number;
  PROVIDERS: PROVIDER[];
  TYPE: "movie";
  DESCRIPTION: string;
  RUNTIME: number;
  SIMILARS: SKINNY_RENDER[];
  GENRE: GENRE[];
  BACKDROP: string;
  POSTER: string;
  DOWNLOAD_URL: string;
  TRANSCODE_URL: string;
}
export interface TVItem {
  ID: string;
  TYPE: "tv";
  DISPLAY_NAME: string;
  LOGO: string;
  YEAR: string;
  SIMILARS: SKINNY_RENDER[];
  AWARDS: string;
  DIRECTOR: string;
  WRITER: string;
  Vote_Average: number;
  TAGLINE: string;
  PROVIDERS: PROVIDER[];
  DESCRIPTION: string;
  RUNTIME: number;
  GENRE: GENRE[];
  BACKDROP: string;
  POSTER: string;
  SEASONS: SEASON[];
}
export interface SEASON {
  ID: number;
  SEASON_NUMBER: number;
  NAME: string;
  DESCRIPTION: string;
  BACKDROP: string;
  EPISODES: EPISODE[];
}
export interface EPISODE {
  ID: number;
  TYPE: "episode";
  EPISODE_NUMBER: number;
  FILES: FileItem[];
  NAME: string;
  DESCRIPTION: string;
  STILL: string;
  TRANSCODE_URL: string;
  WATCH: WATCH_DATA;
  DOWNLOAD_URL: string;
}
export interface FileItem {
  ID: number;
  FILENAME: string;
  DOWNLOAD_URL: string;
  TRANSCODE_URL: string;
  CURRENT: number;
  SIZE: number;
}
export interface PROVIDER {
  PROVIDER_ID: number;
  URL: string;
  PROVIDER_NAME: string;
  DISPLAY_PRIORITY: number;
}

export interface RenderState {
  item: MovieItem | TVItem;
  season: number;
  addModal: boolean;
  convertModal: boolean;
  ChooseStorage: File | null;
  shareModal: FileItem | null;
  requestModal: boolean;
}

class Renderer extends React.Component<RendereProps> {
  public id: string;
  public provider: string;
  public toastId: Id = 0;
  public fileRef: React.RefObject<HTMLInputElement> = React.createRef();
  public currentFile: FileItem = {} as FileItem;
  public state: RenderState = {
    item: {} as MovieItem | TVItem,
    convertModal: false,
    shareModal: null,
    season: 0,
    requestModal: false,
    addModal: false,
    ChooseStorage: null,
  };
  constructor(props: RendereProps) {
    super(props);
    this.provider = props.params.provider;
    this.id = props.params.id;
    this.state.item = props.Item;
    if (this.state.item.TYPE === "movie") {
      this.currentFile = this.state.item.FILES[0];
    }
  }
  componentDidMount() {}
  componentWillUnmount(): void {}
  componentDidUpdate(
    prevProps: Readonly<RendereProps>,
    prevState: Readonly<{}>,
    snapshot?: any
  ): void {
    if (prevProps.Item.ID !== this.props.Item.ID) {
      if (this.props.Item.TYPE === "movie") {
        this.currentFile = this.props.Item.FILES[0];
      }
      this.setState({ item: this.props.Item });
      console.log("Item changed", this.props.Item);
    }
  }
  download() {
    console.log(this.state, "download");
    const base64_backdrop = this.state.item.BACKDROP;
    const id = this.state.item.ID.split("@")[1];
    const provider = this.state.item.ID.split("@")[0];
    if (this.state.item.TYPE === "tv") return;
    if (this.state.item.FILES.length > 0) {
      PlatformManager.DispatchDownload(
        this.currentFile.DOWNLOAD_URL,
        this.state.item,
        this.currentFile.ID
      );
    } else {
      PlatformManager.DispatchDownload(
        this.state.item.DOWNLOAD_URL,
        this.state.item,
        -1
      );
    }
  }

  changeFile(e: React.ChangeEvent<HTMLSelectElement>) {
    if (this.state.item.TYPE === "tv") return;
    this.currentFile = this.state.item.FILES[parseInt(e.target.value)];
  }

  stream() {
    if (!!this.currentFile) {
      var encoded = encodeURIComponent(
        this.currentFile.TRANSCODE_URL + "&file=" + this.currentFile.ID
      );
      this.props.navigate("/player/?transcode=" + encoded);
    } else {
      var item = this.state.item as MovieItem;
      this.props.navigate(
        "/player?transcode=" + encodeURIComponent(item.TRANSCODE_URL)
      );
    }
  }
  browseGenre(id: number, name: string) {
    this.props.navigate(
      `/browse/genre?genre=${id}&name=${encodeURIComponent(
        `Dans la catégorie ${name}`
      )}`
    );
  }
  epDl(
    event: React.MouseEvent | React.ChangeEvent,
    episode: EPISODE,
    i: number
  ) {
    event.stopPropagation();
    if (episode.FILES.length > 0) {
      if (i != -1) {
        PlatformManager.DispatchDownload(
          episode.FILES[i].DOWNLOAD_URL,
          { ...episode, TYPE: "episode" },
          episode.FILES[i].ID
        );
      } else {
        PlatformManager.DispatchDownload(
          episode.FILES[0].DOWNLOAD_URL,
          { ...episode, TYPE: "episode" },
          episode.FILES[0].ID
        );
      }
    } else {
      PlatformManager.DispatchDownload(
        episode.DOWNLOAD_URL,
        { ...episode, TYPE: "episode" },
        -1
      );
    }
  }
  epStr(event: React.MouseEvent, episode: EPISODE, index: number) {
    event.stopPropagation();
    var url = episode.TRANSCODE_URL;
    if (episode.FILES.length > 0) {
      if (index == -1) {
        index = 0;
      }
      url += "&file=" + episode.FILES[index].ID;
    }
    this.props.navigate("/player?transcode=" + encodeURIComponent(url));
  }
  public on_drop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (this.state.item.TYPE === "tv") return;

    const file = e.dataTransfer.files[0];
    if (file.name.endsWith(".torrent")) {
      // this state season is an index
      post_file_torrent(
        file,
        this.state.item.TYPE,
        this.state.item,
        this.state.season
      );
    } else {
      this.setState({ ChooseStorage: file });
    }
  }
  public uploadFile(path: string) {
    if (!this.state.ChooseStorage)
      toast.error("Erreur lors de la récupération du fichier");
    post_file(
      this.state.ChooseStorage!,
      "movie",
      this.state.item.ID,
      path,
      -1,
      -1
    );
  }
  public render() {
    if (typeof this.state.item.ID === "undefined") {
      return <div>Loading...</div>;
    }
    return (
      <div
        onDrop={this.on_drop.bind(this)}
        onDragOver={(e) => e.preventDefault()}
        className="bg-no-repeat bg-cover text-white"
      >
        {this.state.addModal &&
          createPortal(
            <AddModal
              close={() => this.setState({ addModal: false })}
              preload={{
                search: `${this.state.item.DISPLAY_NAME} ${
                  this.state.item.TYPE === "tv"
                    ? `S0${
                        this.state.item.SEASONS[this.state.season].SEASON_NUMBER
                      }`
                    : `${this.state.item.YEAR}`
                }`,
                season:
                  this.state.item.TYPE === "tv" && this.state.season >= 0
                    ? this.state.season
                    : null,
                finalType: this.state.item.TYPE,
                item: this.state.item,
              }}
            />,
            document.body
          )}
        {this.state.ChooseStorage &&
          createPortal(
            <ChooseStorage
              close={() => this.setState({ ChooseStorage: null })}
              onsuccess={(path) => this.uploadFile(path)}
            />,
            document.body
          )}
        {this.state.convertModal && this.state.item.TYPE === "movie" && (
          <ConvertModal
            close={() => this.setState({ convertModal: false })}
            file={this.currentFile}
            item={this.state.item}
            hidden={!this.state.convertModal}
          />
        )}
        {this.state.requestModal && (
          <RequestModal
            itemId={this.state.item.ID}
            type={this.state.item.TYPE}
            seasonId={
              this.state.item.TYPE === "tv"
                ? this.state.item.SEASONS[this.state.season].ID.toString()
                : ""
            }
            close={() => this.setState({ requestModal: false })}
          />
        )}
        {this.state.shareModal != null && (
          <ShareModal
            file_item={this.state.shareModal}
            close={() => this.setState({ shareModal: null })}
          />
        )}
        <BrowserView>
          <div
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,.7), rgba(0,0,0,.7)), url('${this.state.item.BACKDROP}')`,
              backgroundSize: "cover",
            }}
            className="bg-no-repeat bg-cover text-white min-h-screen"
          >
            <div className={`w-full h-full  lg:pl-8 pt-[5%]`}>
              <div className="pl-8 pt-4 w-full">
                <div className="flex">
                  <div className="">
                    <motion.img
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      src={this.state.item.POSTER}
                      className="
                    w-64
                    lg:w-72 
                    xl:w-96 
                    transition-all
                    rounded-lg aspect-[2/3]"
                    />
                  </div>
                  <div className="w-[calc(100%-20%-20px)] ml-[20px]">
                    {this.state.item.LOGO != "" ? (
                      <img
                        src={this.state.item.LOGO}
                        className="w-[250px] xl:w-[500px] h-auto rounded-lg"
                      />
                    ) : (
                      <div className="text-5xl font-bold underline">
                        {this.state.item.DISPLAY_NAME}
                      </div>
                    )}

                    <div className="opacity-80 mt-4 font-bold text-sm">
                      <div className="flex">
                        <div>Tags :</div>&nbsp;
                        {this.state.item.RUNTIME > 0 ? (
                          <div>{FormatRuntime(this.state.item.RUNTIME)}</div>
                        ) : (
                          <></>
                        )}
                        {this.state.item.YEAR ? (
                          <div className="pl-4">{this.state.item.YEAR}</div>
                        ) : (
                          <></>
                        )}
                        {this.state.item.Vote_Average > 0 ? (
                          <div>{this.state.item.Vote_Average}</div>
                        ) : (
                          <></>
                        )}
                        {this.state.item.AWARDS != "" ? (
                          <div>({this.state.item.AWARDS})</div>
                        ) : (
                          <></>
                        )}
                        {this.state.item.DIRECTOR != "" ? (
                          <div className="pl-4">
                            Réalisateur : {this.state.item.DIRECTOR}
                          </div>
                        ) : (
                          <></>
                        )}
                      </div>
                      <div className="flex gap-2 ">
                        {this.state.item.GENRE.map((e, i) => (
                          <div
                            key={i}
                            onClick={() => this.browseGenre(e.ID, e.NAME)}
                            className="underline cursor-pointer "
                          >
                            {e.NAME}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-4">
                        <div
                          className="cursor-pointer"
                          onClick={() => this.setState({ addModal: true })}
                        >
                          Manualy add torrent
                        </div>
                        <div
                          className="cursor-pointer"
                          hidden={
                            this.state.item.TYPE === "tv" ||
                            this.state.item.FILES.length == 0
                          }
                          onClick={() => this.setState({ convertModal: true })}
                        >
                          Convert
                        </div>
                        <div
                          className="cursor-pointer"
                          hidden={
                            (this.state.item.TYPE === "movie" &&
                              this.state.item.FILES.length > 0) ||
                            (this.state.item.TYPE === "tv" &&
                              this.state.item.SEASONS[
                                this.state.season
                              ].EPISODES.reduce((p, c) => {
                                return p + c.FILES.length;
                              }, 0) > 0)
                          }
                          onClick={() => this.setState({ requestModal: true })}
                        >
                          Request When Available
                          {this.state.item.TYPE == "tv"
                            ? `(Season ${
                                this.state.item.SEASONS[this.state.season]
                                  .SEASON_NUMBER
                              })`
                            : ""}
                        </div>
                        <div
                          onClick={() =>
                            this.setState({ shareModal: this.currentFile })
                          }
                          hidden={
                            this.state.item.TYPE === "tv" ||
                            this.state.item.FILES.length == 0
                          }
                        >
                          Share
                        </div>
                      </div>
                    </div>
                    {this.state.item.TYPE === "movie" ? (
                      <>
                        <select
                          hidden={this.state.item.FILES.length == 0}
                          onChange={this.changeFile.bind(this)}
                          className="mt-4 bg-black bg-opacity-50 rounded-lg text-white p-2"
                        >
                          {this.state.item.FILES.map((e, i) => (
                            <option key={i} value={i}>
                              {e.FILENAME}
                            </option>
                          ))}
                        </select>
                        <div className="mt-4 gap-4">
                          <div className="flex gap-10">
                            <div
                              onClick={this.stream.bind(this)}
                              className="w-44 cursor-pointer flex justify-center items-center gap-2 text-[#181818] bg-white font-bold pt-2 pb-2 pl-10 pr-10 rounded-lg"
                            >
                              <FaPlay />
                              <div>
                                {this.state.item.WATCH.CURRENT > 0
                                  ? "Reprendre"
                                  : "Lire"}
                              </div>
                            </div>
                            <div
                              onClick={this.download.bind(this)}
                              className="w-44 cursor-pointer flex justify-center items-center gap-2 bg-[#181818] font-bold pt-2 pb-2 pl-6 pr-6 rounded-lg"
                            >
                              <FaPlay />
                              <div>Télécharger</div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <></>
                    )}
                    <div className="mt-4 font-bold text-2xl">
                      {this.state.item.TAGLINE}
                    </div>
                    <div className="mt-4 w-[85%] text-white font-semibold opacity-90">
                      {this.state.item.DESCRIPTION}
                    </div>
                    {this.state.item.TYPE === "tv" ? (
                      <div className="mt-4">
                        <div className="flex gap-4">
                          <select
                            onChange={(e) =>
                              this.setState({
                                season: parseInt(e.target.value),
                              })
                            }
                            className="bg-black bg-opacity-50 rounded-lg text-white p-2"
                          >
                            {this.state.item.SEASONS.map((e, i) => (
                              <option key={i} value={i}>
                                {e.NAME} -{" "}
                                {e.EPISODES.reduce(
                                  (p, c) => c.FILES.length + p,
                                  0
                                )}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <div className="text-2xl font-semibold pb-2 pt-1">
                            Episodes :{" "}
                          </div>
                          <Swiper slidesPerView={"auto"} spaceBetween={"10px"}>
                            {this.state.item.SEASONS[
                              this.state.season
                            ].EPISODES.map((e, i) => (
                              <SwiperSlide
                                key={i}
                                style={{ width: "fit-content" }}
                              >
                                <EpisodeRender
                                  item={this}
                                  season_index={this.state.season}
                                  i={i}
                                />
                              </SwiperSlide>
                            ))}
                          </Swiper>
                        </div>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>

                <div
                  className="mb-8"
                  hidden={this.state.item.SIMILARS.length == 0}
                >
                  <div className="text-2xl opacity-80 mt-4 font-semibold mb-2 font-roboto ">
                    Similars
                  </div>
                  <Swiper spaceBetween={20} loop slidesPerView={"auto"}>
                    {this.state.item.SIMILARS.map((e, i) => (
                      <SwiperSlide
                        key={i}
                        style={{
                          width: "max-content",
                          marginLeft: `${i === 0 ? "20px" : "0px"}`,
                        }}
                      >
                        <Porenderer nav={this.props.navigate} render={e} />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>
            </div>
          </div>
        </BrowserView>
        <MobileView>
          <div
            style={{
              backgroundImage: `url('${this.state.item.BACKDROP}')`,
              backgroundSize: "cover",
            }}
            className="bg-no-repeat bg-cover w-screen mt-12 h-64"
          >
            <div
              className="
              bg-gradient-to-b
              from-transparent
              to-[#181818]
              via-80%
              flex justify-center items-end
              to-100%
              h-full
              w-screen "
            >
              {this.state.item.LOGO != "" ? (
                <img src={this.state.item.LOGO} className="w-[80vw]" />
              ) : (
                <div className="text-4xl underline pb-2">
                  {this.state.item.DISPLAY_NAME}
                </div>
              )}
            </div>

            <div className="flex opacity-30 mt-1 justify-center">
              {this.state.item.GENRE.map((e) => (
                <>
                  <div
                    onClick={() => this.browseGenre(e.ID, e.NAME)}
                    className="underline cursor-pointer "
                  >
                    {e.NAME}
                  </div>
                  &nbsp;
                </>
              ))}
            </div>
            <div className="flex justify-center opacity-35 gap-1">
              {this.state.item.RUNTIME > 0 ? (
                <div>{FormatRuntime(this.state.item.RUNTIME)}</div>
              ) : (
                <></>
              )}
              &nbsp;
              {this.state.item.YEAR ? (
                <div className="pl-4">{this.state.item.YEAR}</div>
              ) : (
                <></>
              )}
              &nbsp;
              {this.state.item.Vote_Average > 0 ? (
                <div>{this.state.item.Vote_Average}</div>
              ) : (
                <></>
              )}
              &nbsp;
              {this.state.item.AWARDS != "" ? (
                <div>({this.state.item.AWARDS})</div>
              ) : (
                <></>
              )}
              &nbsp;
              <div
                className="cursor-pointer"
                onClick={() => this.setState({ addModal: true })}
              >
                Manualy add torrent
              </div>
              <div
                className="cursor-pointer"
                hidden={
                  this.state.item.TYPE === "tv" ||
                  this.state.item.FILES.length == 0
                }
                onClick={() => this.setState({ convertModal: true })}
              >
                Convert
              </div>
              <div
                className="cursor-pointer"
                hidden={
                  (this.state.item.TYPE === "movie" &&
                    this.state.item.FILES.length > 0) ||
                  (this.state.item.TYPE === "tv" &&
                    this.state.item.SEASONS[this.state.season].EPISODES.reduce(
                      (p, c) => {
                        return p + c.FILES.length;
                      },
                      0
                    ) > 0)
                }
                onClick={() => this.setState({ requestModal: true })}
              >
                Request When Available
                {this.state.item.TYPE == "tv"
                  ? `(Season ${
                      this.state.item.SEASONS[this.state.season].SEASON_NUMBER
                    })`
                  : ""}
              </div>
              <div
                onClick={() => this.setState({ shareModal: this.currentFile })}
                hidden={
                  this.state.item.TYPE === "tv" ||
                  this.state.item.FILES.length == 0
                }
              >
                Share
              </div>
            </div>
            <div>
              <div className="mt-2 text-sm opacity-50 text-center font-semibold pl-2 pr-2">
                {this.state.item.DESCRIPTION}
              </div>
              {this.state.item.TYPE === "movie" ? (
                <div>
                  <select
                    hidden={this.state.item.FILES.length == 0}
                    onChange={this.changeFile.bind(this)}
                    className="mt-4  bg-opacity-50 w-screen rounded-lg text-white p-2"
                  >
                    {this.state.item.FILES.map((e, i) => (
                      <option value={i}>{e.FILENAME}</option>
                    ))}
                  </select>

                  <div className="mt-4">
                    <div
                      onClick={this.stream.bind(this)}
                      className="cursor-pointer flex justify-center w-[90%] ml-[5%] items-center gap-2 bg-white text-[#181818] font-bold pt-2 pb-2 pl-10 pr-10 rounded-lg"
                    >
                      <FaPlay />
                      <div>
                        {this.state.item.WATCH.CURRENT > 0
                          ? "Reprendre"
                          : "Lire"}
                      </div>
                    </div>
                    <div
                      onClick={this.download.bind(this)}
                      className="cursor-pointer flex mt-4 w-[90%] ml-[5%] justify-center items-center gap-2  bg-[#181818] font-bold pt-2 pb-2 pl-6 pr-6 rounded-lg"
                    >
                      <FaPlay />
                      <div>Télécharger</div>
                    </div>
                  </div>
                </div>
              ) : (
                <></>
              )}
            </div>
            {this.state.item.TYPE === "tv" ? (
              <div className="">
                <div className="flex justify-center">
                  <select
                    onChange={(e) =>
                      this.setState({ season: parseInt(e.target.value) })
                    }
                    className="bg-black bg-opacity-50 w-1/2 mt-3 rounded-lg text-white p-2"
                  >
                    {this.state.item.SEASONS.map((e, i) => (
                      <option value={i}>{e.NAME}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-center flex-col mt-4">
                  {this.state.item.SEASONS[this.state.season].EPISODES.map(
                    (e, i) => (
                      <div>
                        <div className="flex w-full text-sm">
                          <img
                            src={e.STILL}
                            className="w-44 xl:w-72 h-auto rounded-lg ml-2"
                          />
                          <div className="w-full flex items-center">
                            <div className="w-full">
                              <div className=" text-center text-base font-semibold">
                                {e.EPISODE_NUMBER}&nbsp;-&nbsp;{e.NAME}
                              </div>
                              <div className="flex justify-center gap-2 ">
                                <div hidden={e.FILES.length == 0}>
                                  ({e.FILES.length})
                                </div>
                                <div
                                  onClick={(event) => this.epDl(event, e, -1)}
                                >
                                  Télécharger
                                </div>
                                <div
                                  onClick={(event) => this.epStr(event, e, -1)}
                                >
                                  Streamer
                                </div>
                              </div>
                              <select
                                hidden={e.FILES.length == 0}
                                onChange={(event) => this.epDl(event, e, i)}
                                className="bg-opacity-50 rounded-lg text-white p-1 w-full"
                              >
                                {e.FILES.map((f, i) => (
                                  <option value={i}>{f.FILENAME}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="pl-1 pr-1 text-sm opacity-40 mt-1 mb-4 leading-4">
                          {e.DESCRIPTION}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            ) : (
              <></>
            )}
            <div className="mt-4 ml-1">
              <div className="mb-2 text-xl opacity-10 pl-4">Similars</div>
              <Swiper slidesPerView={"auto"} spaceBetween={10}>
                {this.state.item.SIMILARS.map((e, i) => (
                  <SwiperSlide
                    key={i}
                    className={`${i == 0 ? "ml-2" : ""}`}
                    style={{ width: "max-content" }}
                  >
                    <Porenderer nav={this.props.navigate} render={e} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </MobileView>
      </div>
    );
  }
}

export function FormatRuntime(time: number) {
  var minute: number = Math.floor(time % 60);
  var heure: number = Math.floor(time / 60);
  var second = Math.floor((time - Math.floor(time)) * 60);
  return `${heure > 0 ? heure + "h" : ""}${minute > 0 ? minute + "m" : ""}${
    second > 0 ? second + "s" : ""
  }`;
}
export function GetProgress(p: WATCH_DATA): string {
  if (p.CURRENT == 0) {
    return "0%";
  }
  return `${(p.CURRENT / p.TOTAL) * 100}%`;
}

export async function post_file(
  file: File,
  type: "tv" | "movie",
  id: string,
  path: string,
  season: number = -1,
  episode: number = -1
) {
  var form = new FormData();
  console.log(file);
  form.append("file", file);
  form.append("type", type);
  form.append("id", id);
  form.append("path", path);
  if (type == "tv") {
    if (season == -1 || episode == -1)
      throw new Error("Season and episode must be provided");
    form.append("season", season.toString());
    form.append("episode", episode.toString());
  }

  const xhr = new XMLHttpRequest();
  var toastId = toast.info("Upload en cours", {
    autoClose: false,
  });
  xhr.upload.onprogress = (e) => {
    toast.update(toastId, {
      render: `Upload en cours ${Number((e.loaded / e.total) * 100).toFixed(
        1
      )}%`,
    });
  };
  xhr.onload = (e) => {
    const json = JSON.parse(xhr.responseText);
    if (xhr.status == 200) {
      toast.update(toastId, {
        render: "Upload terminé",
        type: "success",
        autoClose: 5000,
      });
    } else {
      toast.update(toastId, {
        render: `Erreur lors de l'upload : ${json.error}`,
        type: "error",
        autoClose: 5000,
      });
    }
  };

  xhr.onerror = (e) => {
    toast.error("Erreur lors de l'upload");
  };
  xhr.open("POST", `${app_url}/upload`, true);
  xhr.withCredentials = true;
  xhr.send(form);
}
export function setFallbackImage(
  e: React.SyntheticEvent<HTMLImageElement, Event>
) {
  //   e.currentTarget.src = "/fallback.png";
  e.currentTarget.src = unavailable;
}
function EpisodeRender(props: {
  item: Renderer;
  season_index: number;
  i: number;
}) {
  const season = (props.item.state.item as TVItem).SEASONS[props.season_index];
  const e = season.EPISODES[props.i];
  const [file, setFile] = useState<File | null>(null);
  const on_choosedStorage = (path: string) => {
    if (!file) return;
    console.log(file.name);
    if (file.name.endsWith(".torrent")) {
      post_file_torrent(
        file,
        props.item.state.item.TYPE,
        props.item.state.item,
        props.season_index
      );
    } else {
      post_file(file, "tv", props.item.state.item.ID, path, season.ID, e.ID);
    }
  };
  const on_drop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setFile(e.dataTransfer.files[0]);
  };

  return (
    <div
      onDrop={on_drop}
      onDragOver={(e) => e.preventDefault()}
      onClick={(event) => props.item.epStr(event, e, -1)}
      className={`flex flex-col w-60 border-2  relative rounded-lg border-transparent hover:border-white cursor-pointer group`}
    >
      {file &&
        createPortal(
          <ChooseStorage
            close={() => setFile(null)}
            onsuccess={on_choosedStorage}
          />,
          document.body
        )}
      <div className="relative w-full h-36">
        <div className="absolute w-full h-full bg-black bg-opacity-50 rounded-lg">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden group-hover:block h-8 w-8">
            <FaPlay className="w-full h-full" />
          </div>
          <div className="flex items-center absolute top-1 left-1 gap-1">
            <CgUnavailable
              className={`${e.FILES.length > 0 ? "hidden" : ""}`}
            />
          </div>
        </div>
        <img
          onError={setFallbackImage}
          src={e.STILL}
          className="w-full h-full rounded-lg"
        />
      </div>
      <div className="text-center flex items-center justify-center">
        <div>
          ({e.EPISODE_NUMBER}) {e.NAME}
        </div>
      </div>
      <div className="flex justify-between items-center pb-1 mt-1">
        <div
          onClick={(event) => props.item.epStr(event, e, -1)}
          className="w-[50%] mr-1 ml-1 h-7 flex justify-center items-center bg-white text-black font-bold rounded-lg"
        >
          Lire
        </div>
        <div
          onClick={(event) => props.item.epDl(event, e, -1)}
          className="w-[50%] mr-1 h-7 flex justify-center items-center bg-white text-black font-bold rounded-lg"
        >
          Télécharger
        </div>
      </div>
      <div className="text-left opacity-50 leading-5 max-h-28  no-scrollbar">
        {e.DESCRIPTION}
      </div>
    </div>
  );
}
