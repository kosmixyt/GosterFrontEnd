import _ from "lodash";
import { PosterRenderer, SKINNY_RENDER } from "../poster";
import React, { useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Bottom } from "../../landing";

export const chunk_size = window.innerWidth > 1000 ? 6 : window.innerWidth > 600 ? 4 : 3;
export const ChunkDisplay = (props: { items: SKINNY_RENDER[]; hidden?: boolean }) => {
  const [items, setItems] = React.useState<SKINNY_RENDER[]>(props.items.slice(0, chunk_size * 4));
  useEffect(() => {
    setItems(_.take(props.items, chunk_size * 10));
  }, [props.items]);
  return (
    <InfiniteScroll
      dataLength={items.length}
      next={() => {
        console.log("next");
        setItems(_.take(props.items, items.length + 4 * chunk_size));
      }}
      hasMore={items.length < props.items.length}
      loader={<div className="w-full flex justify-center">Chargement ...</div>}
    >
      <div className="w-full flex flex-wrap gap-2 md:gap-4 justify-center">
        {items.map((item, i) => (
          <PosterRenderer key={i} {...item} />
        ))}</div>
    </InfiniteScroll>
  );
};
