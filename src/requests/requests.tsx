import { useEffect, useState } from "react";
import close from "./close.svg";
import { app_url } from "..";
import { toast } from "react-toastify";

const BYTE_TO_GO = 1073741824;
export function RequestModal(props: { close: () => void; itemId: string; seasonId: string; type: string }) {
  const [maxSize, setMaxSize] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        props.close();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflowY = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflowY = "auto";
    };
  }, [props]);
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black opacity-50"></div>
      <div className="fixed z-10  rounded-lg p-4 bg-[#181818] flex flex-col w-1/4 justify-center">
        <img src={close} alt="close" className="top-3 right-3 w-6 h-6 cursor-pointer absolute" onClick={props.close} />
        <div className="text-center text-2xl underline underline-offset-4 font-semibold">Download Request</div>

        <div className="text-xs opacity-50">
          Lors que le media sera disponible au téléchargement il sera téléchargé si sa taille et égale ou inférieur à la taille indiqué ci dessous et que votre
          compte à le créédi suffisant
        </div>
        <div className="text-center mt-2 flex justify-center">
          <input type="number" placeholder="Max Size" value={maxSize} onChange={(e) => setMaxSize(Number(e.target.value))} />
          Go
        </div>
        <div
          onClick={() => {
            RequestItem(maxSize * BYTE_TO_GO, props.itemId, props.seasonId, props.type);
            props.close();
          }}
          className="text-center mt-2"
        >
          Demander
        </div>
      </div>
    </div>
  );
}

export async function RequestItem(maxsize: number, itemId: string, seasonId: string, type: string) {
  const info = toast.info("Requesting download", { autoClose: false });
  const res = await fetch(`${app_url}/request/new?max_size=${maxsize}&id=${itemId}&type=${type}&season_id=${seasonId}`, {
    method: "POST",
    credentials: "include",
  });
  const data = await res.json();
  if (data.status === "error") {
    toast.update(info, { render: data.message, type: "error" });
  }
  if (data.status === "success") {
    toast.update(info, { render: data.message, type: "success" });
  }
}
