import { useState } from "react";
import { FileItem } from "../render/render";
import { SearchRender } from "../search/search";
import { SKINNY_RENDER } from "../component/poster";

export function MoveMediaFile(props: { file: FileItem; close: () => void }) {
  const [target, setTarget] = useState<SKINNY_RENDER | null>(null);

  return (
    <SearchRender
      title="Move Media File"
      onselect={(e, j) => setTarget(j)}
      headTitle="Move Media File"
      close={props.close}
    />
  );
}
