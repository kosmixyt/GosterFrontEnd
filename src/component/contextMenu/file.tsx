import { MoveMediaFile } from "../../metadata/dragger";
import { CreateShare, ShareModal } from "../../me/landing";
import { FileItem } from "@/src/render/render";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConvertModal } from "../../convert/convert";

export function ContextMenu(props: { file?: FileItem | null }) {
  const nav = useNavigate();
  const [hidden, setHidden] = useState(true);
  const [shareModal, setShareModal] = useState(false);
  const [WrongFile, setWrongFile] = useState(false);
  const [convertModal, setConvertModal] = useState(0);
  if (
    !props.file ||
    props.file == undefined ||
    props.file == null ||
    Object.keys(props.file).length === 0
  )
    return <div></div>;
  if (hidden) {
    return (
      <div
        onClick={(e) => {
          setHidden(false);
          e.stopPropagation();
        }}
      >
        File Options
      </div>
    );
  }
  const style_case = "p-1 hover:bg-slate-800 cursor-pointer text-md";
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <div
        onClick={(e) => {
          setHidden(true);
          e.stopPropagation();
        }}
      >
        File Options
      </div>
      <div className=" absolute bg-slate-700 w-40 text-center z-50 rounded-lg">
        <div
          className={`${style_case}`}
          onClick={() =>
            nav(
              `/player?transcode=${encodeURIComponent(
                props.file!.TRANSCODE_URL
              )}`
            )
          }
        >
          Stream
        </div>
        <div
          className={`${style_case}`}
          onClick={() => {
            window.open(props.file!.DOWNLOAD_URL, "_blank");
          }}
        >
          Download
        </div>
        <div className={`${style_case}`} onClick={() => setShareModal(true)}>
          {shareModal && (
            <ShareModal
              close={(e) => {
                e.stopPropagation();
                setShareModal(false);
              }}
              file_item={props.file!}
            />
          )}
          Share
        </div>
        <div className={`${style_case}`} onClick={() => setWrongFile(true)}>
          {WrongFile && (
            <div onClick={(e) => e.stopPropagation()}>
              <MoveMediaFile
                close={() => setWrongFile(false)}
                file={props.file!}
              />
            </div>
          )}
          Wrong file ?
        </div>
        <div className={`${style_case}`} onClick={() => setConvertModal(1)}>
          {convertModal == 1 && (
            <div onClick={(e) => e.stopPropagation()}>
              <ConvertModal
                hidden={false}
                close={() => setConvertModal(0)}
                file={props.file!}
              />
            </div>
          )}
          Convert
        </div>
      </div>
    </div>
  );
}
