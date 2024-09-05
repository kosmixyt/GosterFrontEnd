import { random } from "lodash";
import { bytesToSize } from "../torrent";
import { app_url } from "..";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MiniDisplay } from "../component/minidisplaySquare/mini";
import { FileItem } from "../render/render";

// export const Media_Request = [1, 2, 3, 4, 5, 6];

export function UserLanding() {
  const [me, setMe] = useState<Me | undefined>(undefined);
  const nav = useNavigate();
  useEffect(() => {
    fetch(`${app_url}/me`, { credentials: "include" }).then((res) => res.json().then(setMe));
  }, []);
  console.log(me);
  if (!me) return <div>Loading...</div>;
  return (
    <div className="flex flex-col justify-center mt-12 h-full">
      <div className="text-3xl text-center underline">Me</div>
      <table className="border-spacing-10 border-collapse">
        <thead>
          <tr>
            <th>Status</th>
            <th>Type</th>
            <th>Max size</th>
            <th>Media Name</th>
            <th>Last Refresh</th>
          </tr>
        </thead>
        <tbody className="">
          {me.requests.map((item: MeRequest, i: number) => (
            <tr key={i}>
              <td className="capitalize">{item.Status}</td>
              <td className="capitalize">{item.Type}</td>
              <td>{bytesToSize(item.MaxSize)}</td>
              <td>
                <MiniDisplay itemId={item.Media_ID.toString()} itemType={item.Media_Type.toString()}>
                  {item.Media_Name}
                </MiniDisplay>
              </td>

              <td>{item.Last_Update}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <table className="border-spacing-10 border-collapse">
        <thead>
          <tr>
            <th>ID</th>
            <th>Expires</th>
            <th>File</th>
          </tr>
        </thead>
        <tbody>
          {me.shares.map((item: Me_Share, i: number) => (
            <tr key={i}>
              <td>{item.ID}</td>
              <td>{item.EXPIRE}</td>
              <td>
                <MiniDisplay itemId={item.MEDIA_ID} itemType={item.MEDIA_TYPE}>
                  {item.FILE.FILENAME}
                </MiniDisplay>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface Me {
  id: number;
  username: string;
  requests: MeRequest[];
  Notifications: MeNotification[];
  allowed_upload_number: number;
  current_upload_number: number;
  allowed_upload_size: number;
  current_upload_size: number;
  allowed_transcode: number;
  current_transcode: number;
  shares: Me_Share[];
}

interface MeNotification {
  ID: number;
  Message: string;
}

interface MeRequest {
  ID: number;
  Created: string;
  Type: string;
  Status: string;
  Last_Update: string;
  MaxSize: number;
  Interval: number;
  Media_Name: string;
  Media_Type: string;
  Media_ID: string;
  Torrent_ID: number;
  Torrent_Name: string;
}

type Me_Share = {
  ID: number;
  EXPIRE: Date;
  FILE: FileItem;
  MEDIA_TYPE: string;
  MEDIA_ID: string;
};
