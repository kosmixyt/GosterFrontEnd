import ReactDOM from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { Render } from "./render/render";
import { Landing, landing_loader } from "./landing";
import { BrowseFunc } from "./browser/browse";
import { PlayerRender } from "./player/player";
import { LoginComp } from "./login/login";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import { Iptv, UnorderedIptv } from "./iptv/iptv";
import { Head } from "./layout/layout";
export const app_url = "https://app.kosmix.fr/api";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLDivElement
);
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
        path: "/admin",
        element: <Admin />,
      },
      {
        path: "/admin/files",
        element: <DisplayFiles />,
      },
      {
        path: "/login",
        element: <LoginComp />,
      },
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
        path: "/dragger",
        element: <Updater />,
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
import Updater from "./metadata/updater";
import Admin from "./admin";
import { DisplayFiles } from "./admin/files";
import { PTY } from "./pty/pty";

