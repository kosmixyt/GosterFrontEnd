import React, { CSSProperties } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FormatRuntime, WATCH_DATA } from "../../render/render";
import { PiTelevisionSimpleDuotone } from "react-icons/pi";
import { MdMovieCreation } from "react-icons/md";
import { isMobile } from "react-device-detect";
// id = po

// type SKINNY_RENDER struct {
// 	ID          int
// 	PROVIDER    string
// 	TYPE        string
// 	NAME        string
// 	POSTER      string
// 	BACKDROP    string
// 	DESCRIPTION string
// 	YEAR        string
// 	RUNTIME     int
// }
export interface GENRE {
  ID: number;
  NAME: string;
}
// type PROVIDERItem struct {
// 	PROVIDER_ID      int
// 	URL              string
// 	PROVIDER_NAME    string
// 	DISPLAY_PRIORITY int
// }
export interface PROVIDERItem {
  PROVIDER_ID: number;
  URL: string;
  PROVIDER_NAME: string;
  DISPLAY_PRIORITY: number;
}
export interface SKINNY_RENDER {
  ID: string;
  TYPE: string;
  NAME: string;
  POSTER: string;
  BACKDROP: string;
  DESCRIPTION: string;
  YEAR: string;
  RUNTIME: number;
  GENRE: GENRE[];
  TRAILER: string;
  WATCH: WATCH_DATA;
  WATCHLISTED: boolean;
  LOGO: string;
  TRANSCODE_URL: string;
  PROVIDERS: PROVIDERItem[];
}
export type InheritGo = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, item: SKINNY_RENDER) => void;

export interface PosterRendererProps {
  render: SKINNY_RENDER;
  nav: any;
  className?: string;
  InheritGo?: InheritGo;
}
export const PosterRenderer = (
  props: SKINNY_RENDER & {
    className?: string;
    InheritGo?: InheritGo;
  }
) => {
  const nav = useNavigate();
  const history = useLocation();
  return <Porenderer InheritGo={props.InheritGo} className={props.className} render={props} nav={nav} />;
};
export class Porenderer extends React.Component<PosterRendererProps> {
  public ic = React.createRef<HTMLDivElement>();
  constructor(props: PosterRendererProps) {
    super(props);
  }
  onhoverImg = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {};
  onunhoverImg = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {};
  go(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (this.props.InheritGo) {
      return this.props.InheritGo(event, this.props.render);
    }
    this.props.nav(`/render/${this.props.render.TYPE}/${this.props.render.ID}`);
  }
  play(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    event.stopPropagation();
    this.props.nav(`/player?transcode=${encodeURIComponent(this.props.render.TRANSCODE_URL)}`);
  }
  navigateProvider(event: React.MouseEvent<HTMLDivElement, MouseEvent>, f: PROVIDERItem) {
    event.stopPropagation();
    this.props.nav(`/browse/provider?provider=${f.PROVIDER_ID}`);
  }

  render() {
    return (
      <div onClick={this.go.bind(this)} className={`w-40 2xl:w-52 ${this.props.className}  lg:mt-4  lg:mb-4 lg:ml-1 lg:mr-1`}>
        <div className="relative border-2 border-transparent lg:hover:border-white rounded-xl h-auto cursor-pointer lg:hover:scale-110 duration-200 delay-100 transition-all ">
          <div
            style={{
              width: Math.round((this.props.render.WATCH.CURRENT / this.props.render.WATCH.TOTAL) * 100) + "%",
            }}
            className="absolute bottom-0 bg-red-700 h-1"
          ></div>
          <div className="w-full h-full rounded-xl lg:hover:backdrop-blur-sm lg:hover:bg-[#181818]  lg:hover:bg-opacity-60 absolute group">
            <div className="lg:group-hover:block hidden">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  this.props.nav(`/browse/${this.props.render.TYPE}`);
                }}
                className="absolute  top-1 left-1 font-semibold capitalize  text-sm right-2 h-6 w-6"
              >
                {this.props.render.TYPE === "tv" ? <PiTelevisionSimpleDuotone className="w-full h-full" /> : <MdMovieCreation className="w-full h-full" />}
              </div>
              <div className="absolute top-1 right-1 flex gap-1 justify-end">
                {this.props.render.PROVIDERS.splice(0, 4).map((e) => (
                  <div onClick={(ev) => this.navigateProvider(ev, e)}>
                    <img className="h-7 rounded-lg" src={e.URL} alt={e.PROVIDER_NAME} />
                  </div>
                ))}
              </div>
              <div className="absolute bottom-[calc(1rem+1.25rem)] pl-1">
                <div className="text-white font-bold leading-4 text-lg">
                  {this.props.render.NAME.length > 30 ? this.props.render.NAME.substring(0, 40) + "..." : this.props.render.NAME} :
                </div>
                <div className="text-xs 2xl:text-sm white font-medium opacity-70 leading-[0.8rem] max-h-[100px] overflow-auto no-scrollbar mt-1">
                  {this.props.render.DESCRIPTION}
                </div>
              </div>
              <div
                onClick={this.play.bind(this)}
                className="absolute w-[calc(100%-2*0.25rem)] h-7 rounded-lg bg-white left-1 bottom-1 flex justify-center items-center"
              >
                <div className="text-[#181818] text-sm font-semibold">Lire</div>
              </div>
            </div>
          </div>
          <img loading="lazy" className="h-full w-full rounded-xl" src={this.props.render.POSTER} alt={this.props.render.NAME} />
        </div>
        <div className="flex justify-center font-bold lg:hidden">
          <div className="text-center text-sm">
            {this.props.render.NAME.length > 30 ? this.props.render.NAME.substring(0, 40) + "..." : this.props.render.NAME}
          </div>
        </div>
      </div>
    );
  }
}
