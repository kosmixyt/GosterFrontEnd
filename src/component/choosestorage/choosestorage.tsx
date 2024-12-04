import { useEffect, useState } from "react";
import { Modal } from "../../player/player";
import { GetStorages, StorageRender } from "../../torrent";

export function ChooseStorage(props: {
  close: () => void;
  onsuccess: (c: StorageRender, path: string) => void;
  dontFetch?: StorageRender[];
}) {
  const [storages, setStorages] = useState<StorageRender[]>([]);
  useEffect(() => {
    if (props.dontFetch) {
      return setStorages(props.dontFetch);
    }
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
        <div className="text-white text-center flex justify-center">
          Choose where to store your data
        </div>
        <div onClick={props.close}>Close</div>
        <div className="flex justify-center gap-4">
          {storages.map((e) => (
            <RenderStorage
              key={e.id}
              storage={e}
              onclick={(path) => {
                props.onsuccess(e, path);
                props.close();
              }}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
}
function RenderStorage(props: {
  storage: StorageRender;
  onclick: (path: string) => void;
}) {
  const [path, setPath] = useState<string>(props.storage.paths[0]);
  return (
    <div key={props.storage.id} className={`p-2 rounded-lg cursor-pointer`}>
      Choose : {props.storage.name}
      <select
        className="bg-stone-800 text-white"
        onChange={(e) => setPath(e.target.value)}
      >
        {props.storage.paths.map((e) => (
          <option key={e} value={e}>
            {e}
          </option>
        ))}
      </select>
      <button
        className="bg-stone-800 text-white"
        onClick={(j) => {
          j.stopPropagation();
          props.onclick(path);
        }}
      >
        Choose
      </button>
    </div>
  );
}