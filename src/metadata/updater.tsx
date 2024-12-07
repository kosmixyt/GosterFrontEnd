import { GENRE, SKINNY_RENDER } from "../component/poster";
import { Provider } from "../component/contentprovider/contentprov";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { app_url } from "..";
import { createPortal } from "react-dom";
import { IoIosCloseCircle } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { MovieItem, TVItem } from "../render/render";
import { PlatformManager } from "../cordova/platform";
import { move } from "./dragger";
import { SearchRender } from "../search/search";
import { bytesToSize } from "../torrent";
import { toast } from "react-toastify";

type File = {
  id: number;
  name: string;
  path: string;
  size: number;
};

type MovieMetadata = {
  id: number;
  name: string;
  tmdb_id: number;
  files: File[];
};

type EpisodeMetadata = {
  id: number;
  name: string;
  number: number;
  files: File[];
};

type SeasonMetadata = {
  id: number;
  name: string;
  number: number;
  episodes: EpisodeMetadata[];
};

type TvMetadata = {
  id: number;
  name: string;
  tmdb_id: number;
  seasons: SeasonMetadata[];
};
interface MetadataRes {
  movies: MovieMetadata[];
  tvs: TvMetadata[];
  orphans: File[];
}

type moveLocalToMovie = (
  sourceFile: number,
  sourceType: "movie" | "tv",
  outputMovieId: number
) => void;
type moveLocalToEpisode = (
  sourceFile: number,
  sourceType: "movie" | "tv",
  outputSeasonId: number,
  outputEpisodeId: number
) => void;
interface dispositionItem {
  value: "movie" | "tv" | "orphan";
  width: CSSProperties;
}
type moveLocalToOrphan = (
  sourceFile: number,
  sourceType: "movie" | "tv"
) => void;
export default function () {
  const [movies, setmovies] = useState<MovieMetadata[]>([]);
  const [tvs, settvs] = useState<TvMetadata[]>([]);
  const [orphans, setOrphans] = useState<File[]>([]);
  const [disposition, setDisposition] = useState<dispositionItem[]>([
    {
      value: "orphan",
      width: { width: "33%" },
    },
    {
      value: "tv",
      width: { width: "33%" },
    },
    {
      value: "movie",
      width: { width: "33%" },
    },
  ]);

  const navigate = useNavigate();
  useEffect(() => {
    (async () => {
      const res = await fetch(`${app_url}/metadata/items`, {
        credentials: "include",
      });
      const data: MetadataRes = await res.json();
      setmovies(data.movies);
      settvs(data.tvs);
      setOrphans(data.orphans);
    })();
  }, []);
  const moveLocalToMovie = (
    sourceFile: number,
    sourceType: string,
    outputMovieId: number
  ) => {
    console.log("from", sourceType, "to movie");
    if (sourceType == "movie") {
      const movie = movies.find((movie) =>
        movie.files.find((file) => file.id === sourceFile)
      );
      if (movie) {
        const file = movie.files.find((file) => file.id === sourceFile);
        if (!file) throw new Error("File not found");
        const outputMovie = movies.find((movie) => movie.id === outputMovieId);
        if (!outputMovie) throw new Error("Output movie not found");
        if (outputMovie.id === movie.id) {
          return toast.error("Cannot move to same movie");
        }
        if (outputMovie) {
          outputMovie.files.push(file);
          movie.files = movie.files.filter((file) => file.id !== sourceFile);
        }
        setmovies([...movies]);
      }
    }
    if (sourceType == "tv") {
      const sourceTv = tvs.find((tv) =>
        tv.seasons.some((season) =>
          season.episodes.some((episode) =>
            episode.files.some((file) => file.id === sourceFile)
          )
        )
      );
      if (sourceTv) {
        const sourceSeason = sourceTv.seasons.find((season) =>
          season.episodes.some((episode) =>
            episode.files.some((file) => file.id === sourceFile)
          )
        );
        if (!sourceSeason) throw new Error("Source season not found");
        const sourceEpisode = sourceSeason.episodes.find((episode) =>
          episode.files.some((file) => file.id === sourceFile)
        );
        if (!sourceEpisode) throw new Error("Source episode not found");
        const file = sourceEpisode.files.find((file) => file.id === sourceFile);
        if (!file) throw new Error("File not found");
        const outputMovie = movies.find((movie) => movie.id === outputMovieId);
        if (!outputMovie) throw new Error("Output movie not found");
        if (outputMovie) {
          outputMovie.files.push(file);
          sourceEpisode.files = sourceEpisode.files.filter(
            (file) => file.id !== sourceFile
          );
        }
        settvs([...tvs]);
        setmovies([...movies]);
      } else {
        toast.error("Source tv not found");
      }
    }
    if (sourceType == "orphan") {
      const file = orphans.find((file) => file.id === sourceFile);
      if (file) {
        const outputMovie = movies.find((movie) => movie.id === outputMovieId);
        if (!outputMovie) throw new Error("Output movie not found");
        if (outputMovie) {
          outputMovie.files.push(file);
          setOrphans(orphans.filter((file) => file.id !== sourceFile));
        }
        setmovies([...movies]);
      }
    }
  };
  const moveLocalToEpisode = (
    sourceFile: number,
    sourceType: string,
    outputSeasonId: number,
    outputEpisodeId: number
  ) => {
    console.log("from", sourceType, "to episode");
    if (sourceType == "movie") {
      const movie = movies.find((movie) =>
        movie.files.find((file) => file.id === sourceFile)
      );
      if (movie) {
        const file = movie.files.find((file) => file.id === sourceFile);
        if (!file) throw new Error("File not found");
        const outputTv = tvs.find((tv) =>
          tv.seasons.find((season) => season.id === outputSeasonId)
        );
        if (!outputTv) throw new Error("Output tv not found");
        const outputSeason = outputTv.seasons.find(
          (season) => season.id === outputSeasonId
        );
        if (!outputSeason) throw new Error("Output season not found");
        outputSeason.episodes
          .find((episode) => episode.id === outputEpisodeId)!
          .files.push(file);
        movie.files = movie.files.filter((file) => file.id !== sourceFile);
        setmovies([...movies]);
      }
    }
    if (sourceType == "tv") {
      const sourceTv = tvs.find((tv) =>
        tv.seasons.some((season) =>
          season.episodes.some((episode) =>
            episode.files.some((file) => file.id === sourceFile)
          )
        )
      );
      if (sourceTv) {
        const sourceSeason = sourceTv.seasons.find((season) =>
          season.episodes.some((episode) =>
            episode.files.some((file) => file.id === sourceFile)
          )
        );
        if (!sourceSeason) throw new Error("Source season not found");
        const sourceEpisode = sourceSeason.episodes.find((episode) =>
          episode.files.some((file) => file.id === sourceFile)
        );
        if (!sourceEpisode) throw new Error("Source episode not found");
        const file = sourceEpisode.files.find((file) => file.id === sourceFile);
        if (!file) throw new Error("File not found");
        const outputTv = tvs.find((tv) =>
          tv.seasons.find((season) => season.id === outputSeasonId)
        );
        if (!outputTv) throw new Error("Output tv not found");
        const outputSeason = outputTv.seasons.find(
          (season) => season.id === outputSeasonId
        );
        if (!outputSeason) throw new Error("Output season not found");
        outputSeason.episodes
          .find((episode) => episode.id === outputEpisodeId)!
          .files.push(file);
        sourceEpisode.files = sourceEpisode.files.filter(
          (file) => file.id !== sourceFile
        );
        settvs([...tvs]);
      } else {
        toast.error("Source tv not found");
      }
    }
    if (sourceType == "orphan") {
      const file = orphans.find((file) => file.id === sourceFile);
      console.log(file);
      if (file) {
        const outputTv = tvs.find((tv) =>
          tv.seasons.find((season) => season.id === outputSeasonId)
        );
        if (!outputTv) throw new Error("Output tv not found");
        const outputSeason = outputTv.seasons.find(
          (season) => season.id === outputSeasonId
        );
        if (!outputSeason) throw new Error("Output season not found");
        outputSeason.episodes
          .find((episode) => episode.id === outputEpisodeId)!
          .files.push(file);
        setOrphans(orphans.filter((file) => file.id !== sourceFile));
        settvs([...tvs]);
      }
    }
  };
  const moveLocalToOrphan = (sourceFile: number, sourceType: string) => {
    console.log("from", sourceType, "to orphan");
    if (sourceType == "movie") {
      const movie = movies.find((movie) =>
        movie.files.find((file) => file.id === sourceFile)
      );
      if (movie) {
        const file = movie.files.find((file) => file.id === sourceFile);
        if (!file) throw new Error("File not found");
        orphans.push(file);
        movie.files = movie.files.filter((file) => file.id !== sourceFile);
        setmovies([...movies]);
        setOrphans([...orphans]);
      }
    }
    if (sourceType == "tv") {
      const sourceTv = tvs.find((tv) =>
        tv.seasons.some((season) =>
          season.episodes.some((episode) =>
            episode.files.some((file) => file.id === sourceFile)
          )
        )
      );
      if (sourceTv) {
        const sourceSeason = sourceTv.seasons.find((season) =>
          season.episodes.some((episode) =>
            episode.files.some((file) => file.id === sourceFile)
          )
        );
        if (!sourceSeason) throw new Error("Source season not found");
        const sourceEpisode = sourceSeason.episodes.find((episode) =>
          episode.files.some((file) => file.id === sourceFile)
        );
        if (!sourceEpisode) throw new Error("Source episode not found");
        const file = sourceEpisode.files.find((file) => file.id === sourceFile);
        if (!file) throw new Error("File not found");
        orphans.push(file);
        sourceEpisode.files = sourceEpisode.files.filter(
          (file) => file.id !== sourceFile
        );
        settvs([...tvs]);
        setOrphans([...orphans]);
      } else {
        toast.error("Source tv not found");
      }
    }
  };
  console.log(disposition.length);
  return (
    <div>
      <div className="flex justify-center gap-10 m-4">
        <button
          onClick={() => {
            const a = JSON.parse(JSON.stringify(disposition));
            a.unshift({ value: "movie", width: "w-1/2" });
            setDisposition(a);
          }}
          className="bg-green-500 p-2 rounded-md text-white"
        >
          Add Movie Panel at Left
        </button>
        <button
          onClick={() => {
            const a = JSON.parse(JSON.stringify(disposition));
            a.push({ value: "movie", width: "w-1/2" });
            setDisposition(a);
          }}
          className="bg-red-500 p-2 rounded-md text-white"
        >
          Add Movie Panel at Right
        </button>
        <button
          onClick={() => {
            const a = JSON.parse(JSON.stringify(disposition));
            a.unshift({ value: "tv", width: "w-1/2" });
            setDisposition(a);
          }}
          className="bg-green-500 p-2 rounded-md text-white"
        >
          Add TV Panel at Left
        </button>
        <button
          onClick={() => {
            const a = JSON.parse(JSON.stringify(disposition));
            a.push({ value: "tv", width: "w-1/2" });
            setDisposition(a);
          }}
          className="bg-red-500 p-2 rounded-md text-white"
        >
          Add TV Panel at Right
        </button>
      </div>
      <div className="flex max-w-full h-[calc(100vh-32px-40px-35px-2*8px)]">
        {disposition.map((dis: dispositionItem, i) => {
          dis.width = { width: `${100 / disposition.length}%` };
          console.log(dis.width.width);
          return (
            <>
              {dis.value === "movie" ? (
                <LineDragMovie
                  disposition={dis}
                  movies={movies}
                  movelocal={moveLocalToMovie}
                />
              ) : dis.value === "tv" ? (
                <LineDragTv
                  tvs={tvs}
                  movelocal={moveLocalToEpisode}
                  disposition={dis}
                />
              ) : (
                <LineDragOrphans
                  moveLocal={moveLocalToOrphan}
                  orphans={orphans}
                />
              )}
            </>
          );
        })}
      </div>
    </div>
  );
}
function LineDragTv(props: {
  tvs: TvMetadata[];
  movelocal: moveLocalToEpisode;
  disposition: dispositionItem;
}) {
  const [renderTv, setRenderTv] = useState<TvMetadata[]>(props.tvs);
  const [search, setSearch] = useState<string>("");
  useEffect(() => {
    if (search === "") {
      setRenderTv(props.tvs);
    } else {
      setRenderTv(
        props.tvs.filter((tv) =>
          tv.name.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, props.tvs]);
  return (
    <div style={props.disposition.width} className={`pt-4 overflow-auto`}>
      <div className="text-center">
        <div className="text-2xl">TV Shows</div>
        <input
          onInput={(e) => setSearch(e.currentTarget.value)}
          value={search}
          type="text"
          placeholder="Search"
          className="w-4/5 p-2 rounded-md border-2 border-white mt-2 mb-2"
        />
      </div>
      <div className="w-full flex justify-center gap-2">
        <button
          onClick={() => {
            setRenderTv(props.tvs);
          }}
          className="bg-green-500 p-2 rounded-md text-white"
        >
          Clear filters
        </button>
        <button
          onClick={() => {
            setRenderTv(props.tvs.filter((tvs) => tvs.tmdb_id !== 0));
          }}
          className="bg-green-500 p-2 rounded-md text-white"
        >
          Show Movie with TMDB ID
        </button>
        <button
          onClick={() => {
            // setRenderMovie(props.movies.filter((movie) => movie.tmdb_id == 0));
            setRenderTv(props.tvs.filter((tvs) => tvs.tmdb_id == 0));
          }}
          className="bg-red-500 p-2 rounded-md text-white"
        >
          Show Movie without TMDB ID
        </button>
      </div>
      <div className="text-center">{renderTv.length} TV Shows</div>
      {renderTv.map((tv) => {
        return <RenderTv tv={tv} movelocal={props.movelocal} key={tv.id} />;
      })}
    </div>
  );
}

function LineDragOrphans(props: {
  orphans: File[];
  moveLocal: moveLocalToOrphan;
}) {
  return (
    <div className="pt-4 overflow-auto">
      <div className="text-center">
        <div className="text-2xl">Orphans</div>
      </div>
      <div className="text-center">{props.orphans.length} Orphans</div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          const id = e.dataTransfer.getData("id");
          const sourceType = e.dataTransfer.getData("type");
          move(id, "db@0", "orphan", null, null).then(() => {
            props.moveLocal(parseInt(id), sourceType as "movie" | "tv");
          });
        }}
        className="pl-2 mt-2"
      >
        {props.orphans.map((file) => {
          return <RenderFile type="orphan" file={file} key={file.id} />;
        })}
      </div>
    </div>
  );
}
function RenderTv(props: { tv: TvMetadata; movelocal: moveLocalToEpisode }) {
  const [autoHide, setAutoHide] = useState<boolean>(false);
  return (
    <div className="bg-slate-700 m-2 rounded-md p-2 text-black">
      <div className="text-white">
        {props.tv.name} - ({props.tv.seasons.length}){" "}
        <button onClick={() => setAutoHide(!autoHide)}>
          {autoHide ? "Expand" : "Hide All"}
        </button>
      </div>
      <div className="pl-2 mt-2">
        {props.tv.seasons.length > 0 ? (
          props.tv.seasons.map((season) => {
            return (
              <RenderSeason
                autoHide={autoHide}
                tv_id={props.tv.id}
                season={season}
                key={season.id}
                moveLocal={props.movelocal}
              />
            );
          })
        ) : (
          <div className="text-red-500 p-2">No seasons</div>
        )}
      </div>
    </div>
  );
}
function RenderSeason(props: {
  season: SeasonMetadata;
  moveLocal: moveLocalToEpisode;
  tv_id: number;
  autoHide: boolean;
}) {
  const [hide, setHide] = useState<boolean>(props.autoHide);
  useEffect(() => {
    setHide(props.autoHide);
  }, [props.autoHide]);
  return (
    <div className="bg-slate-500 m-2 rounded-md p-2">
      <div className="text-white">
        {props.season.name} - ({props.season.episodes.length}){" "}
        <button onClick={() => setHide(!hide)}>{hide ? "Show" : "hide"}</button>
      </div>
      <div className="pl-2 mt-2">
        {props.season.episodes.length > 0 && !hide ? (
          props.season.episodes.map((episode) => {
            return (
              <RenderEpisode
                tv_id={props.tv_id}
                moveLocal={props.moveLocal}
                season={props.season}
                episode={episode}
                key={episode.id}
              />
            );
          })
        ) : props.season.episodes.length === 0 ? (
          <div className="text-red-500 p-2">No episodes</div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
function RenderEpisode(props: {
  episode: EpisodeMetadata;
  season: SeasonMetadata;
  tv_id: number;
  moveLocal: moveLocalToEpisode;
}) {
  return (
    <div className="bg-slate-300 m-2 rounded-md p-2">
      <div>
        {props.episode.name} - ({props.episode.number})
      </div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          const id = e.dataTransfer.getData("id");
          const sourceType = e.dataTransfer.getData("type");
          move(
            id,
            "db@" + props.tv_id.toString(),
            "tv",
            props.season.id,
            props.episode.id
          ).then(() => {
            props.moveLocal(
              parseInt(id),
              sourceType as "movie" | "tv",
              props.season.id,
              props.episode.id
            );
          });
        }}
        className="pl-2 mt-2"
      >
        {props.episode.files.length > 0 ? (
          props.episode.files.map((file) => {
            return <RenderFile type="tv" file={file} key={file.id} />;
          })
        ) : (
          <div className="text-red-500 p-2">No files</div>
        )}
      </div>
    </div>
  );
}
function LineDragMovie(props: {
  movies: MovieMetadata[];
  movelocal: moveLocalToMovie;
  disposition: dispositionItem;
}) {
  const [renderMovie, setRenderMovie] = useState<MovieMetadata[]>(props.movies);
  const [search, setSearch] = useState<string>("");
  useEffect(() => {
    if (search === "") {
      setRenderMovie(props.movies);
    } else {
      setRenderMovie(
        props.movies.filter((movie) =>
          movie.name.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, props.movies]);

  return (
    <div style={props.disposition.width} className={`pt-4 overflow-auto`}>
      <div className="text-center">
        <div className="text-2xl">Movies</div>
        <input
          onInput={(e) => setSearch(e.currentTarget.value)}
          value={search}
          type="text"
          placeholder="Search"
          className="w-4/5 p-2 rounded-md border-2 border-white mt-2 mb-2"
        />
      </div>

      <div className="w-full flex justify-center gap-2">
        <button
          onClick={() => {
            setRenderMovie(props.movies);
          }}
          className="bg-green-500 p-2 rounded-md text-white"
        >
          Clear filters
        </button>
        <button
          onClick={() => {
            setRenderMovie(props.movies.filter((movie) => movie.tmdb_id !== 0));
          }}
          className="bg-green-500 p-2 rounded-md text-white"
        >
          Show Movie with TMDB ID
        </button>
        <button
          onClick={() => {
            setRenderMovie(props.movies.filter((movie) => movie.tmdb_id == 0));
          }}
          className="bg-red-500 p-2 rounded-md text-white"
        >
          Show Movie without TMDB ID
        </button>
      </div>
      <div className="text-center">{renderMovie.length} TV Shows</div>
      {renderMovie.map((movie) => {
        return (
          <RenderMovie
            movie={movie}
            movelocal={props.movelocal}
            key={movie.id}
          />
        );
      })}
    </div>
  );
}
function RenderMovie(props: {
  movie: MovieMetadata;
  movelocal: moveLocalToMovie;
}) {
  return (
    <div className="bg-slate-700 m-2 rounded-md p-2">
      <div>
        {props.movie.name} - ({props.movie.files.length})
      </div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          const id = e.dataTransfer.getData("id");
          const sourceType = e.dataTransfer.getData("type");
          console.log("id", id);
          move(id, "db@" + props.movie.id.toString(), "movie", null, null).then(
            () => {
              props.movelocal(
                parseInt(id),
                sourceType as "movie" | "tv",
                props.movie.id
              );
            }
          );
        }}
        className="pl-2 mt-2"
      >
        {props.movie.files.length > 0 ? (
          props.movie.files.map((file) => {
            return <RenderFile type="movie" file={file} key={file.id} />;
          })
        ) : (
          <div className="text-red-500 p-2">No files</div>
        )}
      </div>
    </div>
  );
}
function RenderFile(props: { file: File; type: "movie" | "tv" | "orphan" }) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.clearData();
        e.dataTransfer.setData("id", props.file.id.toString());
        e.dataTransfer.setData("type", props.type);

        console.log("drag");
      }}
      className="flex bg-slate-200 mt-2 p-1 rounded-lg text-black"
    >
      <div>
        {props.file.name} - {bytesToSize(props.file.size)}
      </div>
    </div>
  );
}
