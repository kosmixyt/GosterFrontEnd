import { useEffect, useState } from "react";
import { Modal } from "../../player/player";
import { GetStorages } from "../../torrent/index";

export function ChooseStorage(props: { close: () => void; onsuccess: (c: string) => void }) {
  const [storages, setStorages] = useState<string[]>([]);
  useEffect(() => {
    document.body.style.overflowY = "hidden";
    GetStorages().then((e) => {
      setStorages(e);
    });
    return () => {
      document.body.style.overflowY = "auto";
    };
  }, []);
  return (
    <Modal>
      <div className="bg-stone-900 p-4">
        <div className="text-white text-center flex justify-center">Choose where to store your data</div>
        <div onClick={props.close}>Close</div>
        <div className="flex justify-center gap-4">
          {storages.map((e) => (
            <div
              key={e}
              className={`p-2 rounded-lg cursor-pointer`}
              onClick={() => {
                props.onsuccess(e);
                props.close();
              }}
            >
              Choose : {e}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
