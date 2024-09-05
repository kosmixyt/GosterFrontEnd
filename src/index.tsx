import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  BrowserRouter as Router,
  RouterProvider,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { Render } from "./render/render";
import { PTY } from "./component/pty/pty";
import { BrowseToWatchlist, Landing, landing_loader } from "./landing";
import { browse_loader, BrowseFunc } from "./browser/browse";
import { PlayerRender } from "./player/player";
import { LoginComp } from "./login/login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import { Iptv, UnorderedIptv } from "./iptv/iptv";
import Torrent from "./torrent";
import { Head } from "./component/layout/layout";
import { Dragger, dragger_loader } from "./metadata/dragger";
import { Updater } from "./metadata/updater";
// export const app_url = "https://xxxxvideos.kosmix.fr/api";
export const app_url = "http://localhost:90/api";
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
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
        path: "/dragger",
        element: <Dragger />,
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
        path: "/torrents",
        element: <Torrent />,
      },
      {
        path: "/me",
        element: <UserLanding />,
      },
      {
        path: "/metadata",
        element: <Dragger />,
      },
      {
        path: "/converts",
        element: <Converts />,
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
import { Converts } from "./convert"; import { UserLanding } from "./me/landing";

