import { GENRE, PROVIDERItem } from "../component/poster";
import { EPISODE, FileItem, MovieItem, SEASON, TVItem } from "../render/render";
import { PlatformManager } from "./platform";

export class CacheManager {
  public static movies = new Map<string, MovieItem>();
  public static tv = new Map<string, TVItem>();
  public static seasons = new Map<number, SEASON>();
  public static episodes = new Map<number, EPISODE>();
  public static genres = new Map<number, GENRE>();
  public static providers = new Map<number, PROVIDERItem>();
  public static files = new Map<number, FileItem>();

  public static AddCachedMovie = (movie: MovieItem) => {
    var prov = [];
    for (const provider of movie.PROVIDERS) {
      prov.push(provider.PROVIDER_ID);
      CacheManager.providers.set(provider.PROVIDER_ID, provider);
    }
    //@ts-ignore
    movie.PROVIDERS = prov;
    var gen = [];
    for (const genre of movie.GENRE) {
      gen.push(genre.ID);
      CacheManager.genres.set(genre.ID, genre);
    }
    //@ts-ignore
    movie.GENRE = gen;

    var files = [];
    for (const file of movie.FILES) {
      CacheManager.files.set(file.ID, file);
      files.push(file.ID);
    }
    //@ts-ignore
    movie.FILES = files;
    CacheManager.movies.set(movie.ID, movie);
  };
  public static AddCachedTv = (tv: TVItem) => {
    var prov = [];
    for (const provider of tv.PROVIDERS) {
      prov.push(provider.PROVIDER_ID);
      CacheManager.providers.set(provider.PROVIDER_ID, provider);
    }
    //@ts-ignore
    tv.PROVIDERS = prov;
    var gen = [];
    for (const genre of tv.GENRE) {
      gen.push(genre.ID);
      CacheManager.genres.set(genre.ID, genre);
    }
    //@ts-ignore
    tv.GENRE = gen;

    var seasons = [];
    for (const season of tv.SEASONS) {
      const season_copy = { ...season };
      CacheManager.seasons.set(season_copy.SEASON_NUMBER, season_copy);
      seasons.push(season_copy.SEASON_NUMBER);
      //@ts-ignore
      season_copy.EPISODES = season_copy.EPISODES.map((episode: EPISODE) => {
        const episode_copy = { ...episode };
        //@ts-ignore
        episode_copy.FILES = episode_copy.FILES.map((file: FileItem) => {
          var copy_file = { ...file };
          CacheManager.files.set(file.ID, file);
          console.log("Adding file", file.ID);
          return copy_file.ID;
        });
        CacheManager.episodes.set(episode_copy.ID, episode_copy);
        return episode_copy.ID;
      });
    }
    //@ts-ignore
    tv.SEASONS = seasons;
    CacheManager.tv.set(tv.ID, tv);
  };
  public static GetFile(file: number) {
    return CacheManager.files.get(file);
  }
  public static GetCachedMovie = (id: string) => {
    // var movie = this.movies.get(id);
    var movie = CacheManager.movies.get(id);
    if (movie == undefined) return undefined;
    movie = { ...movie };
    //@ts-ignore
    movie.GENRE = movie.GENRE.map((genre: number) => this.genres.get(genre));
    //@ts-ignore
    movie.PROVIDERS = movie.PROVIDERS.map((provider: number) => this.providers.get(provider));
    //@ts-ignore
    movie.FILES = movie.FILES.map((file: number) => {
      var c_file = this.files.get(file);
      if (!file) throw new Error("File not found");
      return { ...c_file };
    });
    return movie;
  };
  public static GetItemThroughtFile(fileId: number):
    | { movie: MovieItem; File: FileItem; TYPE: "movie" }
    | {
        TYPE: "tv";
        episode: EPISODE;
        season: SEASON;
        tv: TVItem;
        File: FileItem;
      }
    | null {
    for (const movie of CacheManager.movies.values()) {
      var cached_movie = CacheManager.GetCachedMovie(movie.ID);
      if (!cached_movie) continue;
      for (const file of cached_movie.FILES) {
        if (file.ID === fileId) {
          return { movie: cached_movie, File: file, TYPE: "movie" };
        }
      }
    }
    for (const tv of CacheManager.tv.values()) {
      var cached_serie = CacheManager.GetCachedTv(tv.ID);
      if (!cached_serie) continue;
      for (const season of cached_serie.SEASONS) {
        for (const episode of season.EPISODES) {
          for (const file of episode.FILES) {
            if (file.ID === fileId) {
              return { episode, season, tv, File: file, TYPE: "tv" };
            }
          }
        }
      }
    }
    return null;
  }
  public static GetCachedTv = (id: string) => {
    // var tv = this.tv.get(id);
    var tv = CacheManager.tv.get(id);
    if (tv == undefined) return undefined;
    tv = { ...tv };
    //@ts-ignore
    tv.GENRE = tv.GENRE.map((genre: number) => this.genres.get(genre));
    //@ts-ignore
    tv.PROVIDERS = tv.PROVIDERS.map((provider: number) => this.providers.get(provider));
    //@ts-ignore
    tv.SEASONS = tv.SEASONS.map((season: string) => this.seasons.get(season));
    //@ts-ignore
    tv.SEASONS = tv.SEASONS.map((season: SEASON) => {
      var copy_season = { ...season };
      //@ts-ignore
      copy_season.EPISODES = season.EPISODES.map((episode: string) => this.episodes.get(episode));
      //@ts-ignore
      copy_season.EPISODES = copy_season.EPISODES.map((episode: EPISODE) => {
        var copy_episode = { ...episode };
        //@ts-ignore
        copy_episode.FILES = episode.FILES.map((file: number) => {
          var c = this.files.get(file);
          if (!c) throw new Error("File not found");
          return { ...c };
        });
        return copy_episode;
      });
      return copy_season;
    });
    return tv;
  };
  public static GetCache(item: string, type: string): MovieItem | undefined | TVItem {
    var final: MovieItem | TVItem | undefined = undefined;
    switch (type) {
      case "movie":
        final = CacheManager.GetCachedMovie(item);
        break;
      case "tv":
        final = CacheManager.GetCachedTv(item);
        break;
    }
    if (final) {
      final = { ...final };
      console.log("Cache hit", item, type);
    } else {
      console.log("Cache miss", item, type, CacheManager.movies);
    }
    return final;
  }
  public static SetCache(item: string, type: string, data: MovieItem | TVItem) {
    console.log("Setting cache", item, type);
    switch (type) {
      case "movie":
        CacheManager.AddCachedMovie(data as MovieItem);
        break;
      case "tv":
        CacheManager.AddCachedTv(data as TVItem);
        break;
    }
  }
  public static Save() {
    var cache = {
      movies: Array.from(CacheManager.movies),
      tv: Array.from(CacheManager.tv),
      seasons: Array.from(CacheManager.seasons),
      episodes: Array.from(CacheManager.episodes),
      genres: Array.from(CacheManager.genres),
      providers: Array.from(CacheManager.providers),
      files: Array.from(CacheManager.files),
    };
    return JSON.stringify(cache);
  }
  public static Load(cache: string | null) {
    if (cache == null) return;
    var data = JSON.parse(cache);
    CacheManager.movies = new Map(data.movies);
    CacheManager.tv = new Map(data.tv);
    CacheManager.seasons = new Map(data.seasons);
    CacheManager.episodes = new Map(data.episodes);
    CacheManager.genres = new Map(data.genres);
    CacheManager.providers = new Map(data.providers);
    CacheManager.files = new Map(data.files);
  }
  public static Clear() {
    CacheManager.movies = new Map();
    CacheManager.tv = new Map();
    CacheManager.seasons = new Map();
    CacheManager.episodes = new Map();
    CacheManager.genres = new Map();
    CacheManager.providers = new Map();
    CacheManager.files = new Map();
    PlatformManager.SaveCacheDispatcher();
  }
  constructor() {
    throw new Error("Cannot instantiate CacheManager");
  }
}
