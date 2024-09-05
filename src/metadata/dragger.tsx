import { useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { bytesToSize } from "../torrent";
import { app_url } from "..";
import { toast } from "react-toastify";
import { Updater } from "./updater";

interface MetadataMovie {
  id: number;
  type: "movie";
  movie: {
    id: number;
    name: string;
    year: number;
  };
  tv: null;
}

interface MetadataSerie {
  id: number;
  type: "serie";
  movie: null;
  tv: {
    id: number;
    name: string;
    year: number;
  };
}

interface MetadataUnknown {
  id: number;
  type: "unknown";
  movie: null;
  tv: null;
}

export async function dragger_loader() {}

export function Dragger() {
  const nav = useNavigate();
  const [data, setData] = useState<(MetadataMovie | MetadataSerie | MetadataUnknown)[]>([]);
  useEffect(() => {
    fetch(app_url + "/metadata/list", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);
  return (
    <div className="mt-14 flex justify-between">
      <table className="w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={d.id}>
              <td>{d.id}</td>
              <td>
                <select
                  value={d.type}
                  onChange={(e) => {
                    data[i].type = e.target.value as any;
                    setData([...data]);
                  }}
                >
                  <option value="movie">Movie</option>
                  <option value="serie">Serie</option>
                </select>
              </td>
              <td>{d.type === "movie" ? d.movie.name : d.type === "serie" ? d.tv.name : "Unknown"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
