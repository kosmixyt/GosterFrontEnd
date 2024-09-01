import { useState } from "react";
import { useLoaderData } from "react-router-dom";
import { bytesToSize } from "../torrent";
import { app_url } from "..";
import { toast } from "react-toastify";
import { Updater } from "./updater";

export async function dragger_loader() {
  return await fetch(`${app_url}/metadata/list`, { credentials: "include" }).then((res) => res.json());
}
export interface FileSender {
  id: number;
  filename: string;
  episode_id: number;
  season_id: number;
  movie_id: number;
  path: string;
  size: number;
}
export interface Movie {
  id: number;
  name: string;
}
export interface Tv {
  id: number;
  name: string;
  seasons: Season[];
}
export interface Season {
  id: number;
  name: string;
  number: number;
  episodes: Episode[];
}
export interface Episode {
  id: number;
  name: string;
  number: number;
}
export type AddToEpisodeFunc = (fileId: number, episodeId: number, seasonid: number) => void;
export type AddToMovieFunc = (fileId: number, movieId: number) => void;
export type Hl = "tv" | "movie" | "orphelin" | "none";
export function DragPage() {
  const [data, setData] = useState(useLoaderData() as { files: FileSender[]; movies: Movie[]; tv: Tv[] });
  const addOrphelin = async (fileId: number) => {
    const file = data.files.find((e) => e.id == fileId) as FileSender;
    if (file.episode_id === 0 && file.season_id === 0 && file.movie_id === 0) return toast.error("File already in orphelin area");
    const res = await fetch(`${app_url}/metadata/move?source=${fileId}&destinationType=nil&destinationId=0`, { credentials: "include" });
    const json = await res.json();
    if (!res.ok) return toast.error(`Error moving file ${json.error}`);
    toast.success(json.success);
    file.episode_id = 0;
    file.season_id = 0;
    file.movie_id = 0;
    setData({ ...data, files: [...data.files] });
  };
  const add_to_episode = async (fileId: number, episodeId: number, seasonid: number) => {
    console.log("add file", fileId, "to episode", episodeId);
    const file = data.files.find((e) => e.id == fileId) as FileSender;
    if (file.episode_id === episodeId) return toast.error("File already in episode");
    const res = await fetch(`${app_url}/metadata/move?source=${fileId}&destinationType=tv&destinationId=${episodeId}`, { credentials: "include" });
    const json = await res.json();
    if (!res.ok) return toast.error(`Error moving file ${json.error}`);
    toast.success(json.success);
    file.episode_id = episodeId;
    file.season_id = seasonid;
    file.movie_id = 0;
    setData({ ...data, files: [...data.files] });
  };
  const add_to_movie = async (fileId: number, movieId: number) => {
    console.log("add file", fileId, "to movie", movieId);
    const file = data.files.find((e) => e.id == fileId) as FileSender;
    if (file.movie_id === movieId) return toast.error("File already in movie");
    const res = await fetch(`${app_url}/metadata/move?source=${fileId}&destinationType=movie&destinationId=${movieId}`, { credentials: "include" });
    const json = await res.json();
    if (!res.ok) return toast.error(`Error moving file ${json.error}`);
    toast.success(json.success);
    file.episode_id = 0;
    file.season_id = 0;
    file.movie_id = movieId;
    setData({ ...data, files: [...data.files] });
  };

  return (
    <div className="mt-14">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => {
          window.open("/pty", "_blank", "menubar=no,toolbar=no");
        }}
      >
        Open Shell
      </button>
      <div className="flex">
        <Panel addOrphelin={addOrphelin} initName={"tv"} add_to_episode={add_to_episode} add_to_movie={add_to_movie} data={data} />
        {/* <Panel addOrphelin={addOrphelin} initName={"orphelin"} add_to_episode={add_to_episode} add_to_movie={add_to_movie} data={data} /> */}
        <Panel addOrphelin={addOrphelin} initName={"movie"} add_to_episode={add_to_episode} add_to_movie={add_to_movie} data={data} />
      </div>{" "}
    </div>
  );
}
export function Panel(props: {
  initName: Hl;
  add_to_episode: AddToEpisodeFunc;
  add_to_movie: AddToMovieFunc;
  addOrphelin: (file: number) => void;
  data: { files: FileSender[]; movies: Movie[]; tv: Tv[] };
}) {
  const [TypePanel, setTypePanel] = useState<Hl>(props.initName);
  if (TypePanel === "none") return <></>;
  return (
    <div className="w-1/2">
      <select
        value={TypePanel}
        onChange={(e) => {
          setTypePanel(e.target.value as Hl);
        }}
      >
        {/* <option>none</option> */}
        <option>tv</option>
        <option>movie</option>
        <option>orphelin</option>
      </select>
      {TypePanel === "tv" ? (
        <LeftTv add_to_episode={props.add_to_episode} item={props.data.tv} files={props.data.files.filter((e) => e.episode_id != 0 && e.season_id != 0)} />
      ) : TypePanel === "movie" ? (
        <CenterMovie add_to_movie={props.add_to_movie} item={props.data.movies} files={props.data.files.filter((e) => e.movie_id != 0)} />
      ) : (
        <OrphelinArea addOrphelin={props.addOrphelin} files={props.data.files.filter((e) => e.episode_id == 0 && e.movie_id == 0 && e.season_id == 0)} />
      )}
    </div>
  );
}
function CenterMovie(props: { item: Movie[]; files: FileSender[]; add_to_movie: AddToMovieFunc }) {
  const [search, setSearch] = useState("sous la seine");
  var inter: any = null;
  return (
    <div className="w-full max-h-screen overflow-auto overflow-x-hidden">
      <div className="text-4xl text-center">Movies</div>
      <div className="w-full flex justify-center">
        <input
          type="text"
          className=" h-14 text-3xl m-auto"
          placeholder="Search"
          onChange={(e) => {
            if (inter) clearTimeout(inter);
            inter = setTimeout(() => {
              setSearch(e.target.value);
            }, 200);
          }}
        />
      </div>
      {props.item
        .filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 40)
        .map((movie) => (
          <RenderMovie add_to_movie={props.add_to_movie} item={movie} files={props.files} />
        ))}
    </div>
  );
}
function RenderMovie(props: { item: Movie; files: FileSender[]; add_to_movie: AddToMovieFunc }) {
  const [updater, setUpdater] = useState(false);
  const on_drag_over = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  const on_drop = (e: React.DragEvent<HTMLDivElement>) => {
    const id = parseInt(e.dataTransfer.getData("id"));
    console.log("add file id", id, "to episode", props.item.id);
    props.add_to_movie(id, props.item.id);
  };
  return (
    <div onDrop={on_drop} onDragOver={on_drag_over} className="rounded-t-md bg-slate-700 m-4 border-white border-2">
      {updater && <Updater movieId={props.item.id} close={() => setUpdater(false)} />}
      <div className="flex justify-between rounded-inherit">
        <div className=" pb-1 pl-2 rounded-inherit bg-black w-full flex justify-between">
          <span className="text-xl underline underline-offset-4">
            {props.item.name} (id={props.item.id}) <div onClick={() => setUpdater(!updater)}>Update Metadata</div>
          </span>
        </div>
      </div>
      <div>
        {props.files.map((file, i) => {
          if (file.movie_id !== props.item.id) return <></>;
          return <RenderFile key={i} item={file} />;
        })}
      </div>
    </div>
  );
}

function LeftTv(props: { item: Tv[]; files: FileSender[]; add_to_episode: AddToEpisodeFunc }) {
  console.log("elsld");
  const [search, setSearch] = useState("");
  var inter: any = null;
  return (
    <div className="w-full max-h-screen overflow-auto overflow-x-hidden">
      <div className="text-4xl text-center">Tv Shows</div>
      <div className="w-full flex justify-center">
        <input
          type="text"
          className=" h-14 text-3xl m-auto"
          placeholder="Search"
          onChange={(e) => {
            if (inter) clearTimeout(inter);
            inter = setTimeout(() => {
              setSearch(e.target.value);
            }, 200);
          }}
        />
      </div>
      {props.item
        .filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))
        .map((tv) => (
          <RenderTv add_to_episode={props.add_to_episode} item={tv} files={props.files} />
        ))}
    </div>
  );
}
function RenderTv(props: { item: Tv; files: FileSender[]; add_to_episode: AddToEpisodeFunc }) {
  const [open, setOpen] = useState(props.item.seasons.length <= 4);
  const [updater, setUpdater] = useState(false);

  return (
    <div className="rounded-t-md bg-slate-700 m-4 border-white border-2">
      {updater && <Updater serieId={props.item.id} close={() => setUpdater(false)} />}
      <div className="flex justify-between rounded-inherit">
        <div className=" pb-1 pl-2 rounded-inherit bg-black w-full flex justify-between">
          <span className="text-xl underline underline-offset-4">
            {props.item.name} (id={props.item.id}) <div onClick={() => setUpdater(!updater)}>Update Metadata</div>
          </span>
          <button className="pr-2" onClick={() => setOpen(!open)}>
            {open ? "Close" : "Open"}
          </button>
        </div>
      </div>
      {open && (
        <div>
          {props.item.seasons
            .sort((a, b) => (a.number > b.number ? 1 : -1))
            .map((season: Season) => (
              <RenderSeason add_to_episode={props.add_to_episode} files={props.files.filter((e) => e.season_id == season.id)} key={season.id} item={season} />
            ))}
        </div>
      )}
    </div>
  );
}
function RenderSeason(props: { item: Season; files: FileSender[]; add_to_episode: AddToEpisodeFunc }) {
  const [open, setOpen] = useState(true);
  if (props.item.number == 0 || props.item.episodes == null) return <></>;
  return (
    <div className="p-1 rounded-md border-green-600 border-2">
      <div className="flex justify-between">
        <div className="text-md">S0{props.item.number}</div>
        <button onClick={() => setOpen(!open)}>{open ? "Close" : "Open"}</button>
      </div>
      {open && (
        <div>
          {props.item.episodes
            .sort((a, b) => (a.number > b.number ? 1 : -1))
            .map((episode) => (
              <RenderEpisode
                seasonId={props.item.id}
                add_to_episode={props.add_to_episode}
                key={episode.id}
                item={episode}
                files={props.files.filter((e) => e.episode_id == episode.id)}
              />
            ))}
        </div>
      )}
    </div>
  );
}
function RenderEpisode(props: { seasonId: number; item: Episode; files: FileSender[]; add_to_episode: AddToEpisodeFunc }) {
  const on_drag_over = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  const on_drop = (e: React.DragEvent<HTMLDivElement>) => {
    const id = parseInt(e.dataTransfer.getData("id"));
    console.log("add file id", id, "to episode", props.item.id);
    props.add_to_episode(id, props.item.id, props.seasonId);
  };
  return (
    <div onDrop={on_drop} onDragOver={on_drag_over} className="rounded p-1 text-sm border-yellow-500 border-2">
      <div>
        E0{props.item.number} - {props.item.name}
      </div>
      <div>
        {props.files.map((file, i) => {
          // if (file.episode_id !== props.item.id) return <></>;
          return <RenderFile key={i} item={file} />;
        })}
      </div>
    </div>
  );
}
function MaxLength(name: string, max: number) {
  return name.length > max ? name.substring(0, max) + "..." : name;
}
function RenderFile(props: { item: FileSender }) {
  const on_drag_start = (e: React.DragEvent<HTMLDivElement>) => {
    console.log("dragging", props.item.id);
    e.dataTransfer.setData("id", props.item.id.toString());
  };
  return (
    <div draggable onDragStart={on_drag_start} className="border-2  rounded-md border-red-600 m-2">
      <div className="text-center underline  bg-black text-white rounded-inherit rounded-b-none text-sm">{MaxLength(props.item.filename, 60)}</div>
      <div className="pl-2 mt-1">
        <div>Path : {props.item.path}</div>
        <div>Size : {bytesToSize(props.item.size)}</div>
        <div>Is Torrent : {true ? "Oui" : "Non"}</div>
      </div>
    </div>
  );
}
function OrphelinArea(props: { files: FileSender[]; addOrphelin: (file: number) => void }) {
  const on_drag_over = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  const on_drop = (e: React.DragEvent<HTMLDivElement>) => {
    props.addOrphelin(parseInt(e.dataTransfer.getData("id")));
  };
  return (
    <div className="w-full h-full" onDrop={on_drop} onDragOver={on_drag_over}>
      <div className="text-4xl text-center">Orphelin Area</div>
      <div className="">
        {props.files.map((file) => (
          <RenderFile item={file} />
        ))}
      </div>
    </div>
  );
}
