import React, { CSSProperties } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FormatRuntime, WATCH_DATA } from "../../render/render";
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
    // const newQueryParameters: URLSearchParams = new URLSearchParams();
    // newQueryParameters.set("id", data?.elements[0].ID as string);
    // newQueryParameters.set("type", data?.elements[0].TYPE as string);
    // setSearchParams(newQueryParameters);
  }

  render() {
    return (
      <div onClick={this.go.bind(this)} className={`xl:w-48 w-28 cursor-pointer ${this.props.className}`}>
        <div className="w-full flex justify-center">
          <img loading="lazy" className="h-full w-full rounded-xl" src={this.props.render.POSTER} alt={this.props.render.NAME} />
        </div>
        <div className="">
          <div style={{ fontFamily: "Poetsen One" }} className="text-xs md:text-base mt-2 text-center">
            {this.props.render.NAME.length > 20 ? this.props.render.NAME.substring(0, 20) + "..." : this.props.render.NAME}
          </div>

          <div style={{ fontFamily: "Poetsen One" }} className="text-pink-700 text-md sm:block hidden text-center">
            {this.props.render.YEAR} - {FormatRuntime(this.props.render.RUNTIME)}
          </div>
        </div>
      </div>
    );
  }
}
