import { useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { bytesToSize } from "../torrent";
import { app_url } from "..";
import { toast } from "react-toastify";
import { Updater } from "./updater";


interface metadata_movie {
  id: number
  type: "movie"
  movie: {
    id: number
    name: string
    year: number
  }
  tv: null
}
interface metadata_serie {
  id: number
  type: "serie"
  movie: null
  tv: {
    id: number
    name: string
    year: number
  }
}


export async function dragger_loader() {
  return await fetch(`${app_url}/metadata/list`, { credentials: "include" }).then((res) => res.json());
}

export function Dragger() {
  const nav = useNavigate()
  const data = useLoaderData() as (metadata_movie | metadata_serie)[]


  return <div className="mt-14">cocasse</div>
}