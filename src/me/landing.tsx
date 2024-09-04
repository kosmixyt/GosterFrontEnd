import { random } from "lodash";
import { bytesToSize } from "../torrent";
import { app_url } from "..";

export const Media_Request = [1, 2, 3, 4, 5, 6];

export function UserLanding() {
  fetch(`${app_url}/me`, { credentials: "include" });
  return (
    <div className="flex flex-col justify-center mt-12 h-full">
      <div className="text-3xl text-center underline">Me</div>
      <div className="flex justify-center mt-14">
        <div className="bg-slate-800 text-center w-1/2  rounded-lg pt-4 pb-4">
          <div className="text-2xl underline">Media Request</div>
          <table className="border-spacing-10 border-collapse w-full">
            <thead>
              <th>Status</th>
              <th>Type</th>
              <th>Max size</th>
              <th>Media Name</th>
              <th>Last Refresh</th>
            </thead>
            <tbody className="">
              {Media_Request.map((item) => (
                <tr>
                  <td>{random() > 0.5 ? "Pending" : "Done"}</td>
                  <td>{random() > 0.5 ? "Movie" : "Tv"}</td>
                  <td>{bytesToSize(random(1000000, 10000000000))}</td>
                  <td>La casa de papel {random() > 0.5 ? "(S01)" : ""}</td>
                  <td>
                    {new Date().toLocaleTimeString()} {new Date().toLocaleDateString()}
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
