import ReactDOM from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { Render } from "./render/render";
import { PTY } from "./component/pty/pty";
import { Landing, landing_loader } from "./landing";
import { BrowseFunc } from "./browser/browse";
import { PlayerRender } from "./player/player";
import { LoginComp } from "./login/login";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import { Iptv, UnorderedIptv } from "./iptv/iptv";
import { Head } from "./component/layout/layout";
import fs from "fs";
export const app_url = "https://xxxxvideos.kosmix.fr/api";
// export const app_url = "http://localhost:90/api";
console.log("fs", fs);
const root = ReactDOM.createRoot(document.body);
var globalMute = false;
export const setMute = (mute: boolean) => {
  globalMute = mute;
};
export const getMute = () => {
  return globalMute;
};
declare global {
  interface Window {
    isMauiApp: boolean;
  }
}
const router = createBrowserRouter([
  {
    element: <Head />,
    children: [
      {
        path: "/login",
        element: <LoginComp />,
      },
      {
        path: "/",
        element: <Landing />,
        loader: landing_loader,
      },
      {
        path: "/render/:type/:id",
        element: <Render key={window.location.pathname} />,
      },
      {
        path: "/browse/:action",
        element: <BrowseFunc />,
      },
      {
        path: "/me",
        element: <UserLanding />,
      },
      {
        path: "/watchlist",
        element: <Navigate replace to={"/browse?action=watchlist"} />,
      },
      {
        path: "/providers/:id",
        element: <Iptv />,
      },
      {
        path: "/providers",
        element: <UnorderedIptv />,
      },
      {
        path: "/player",
        element: <PlayerRender />,
      },
      {
        path: "/pty",
        element: <PTY />,
      },
    ],
  },
]);
root.render(<RouterProvider router={router} />);

import { Buffer } from "buffer";
import { UserLanding } from "./me/landing";
