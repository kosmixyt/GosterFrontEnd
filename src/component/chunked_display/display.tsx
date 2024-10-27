import _ from "lodash";
import { PosterRenderer, SKINNY_RENDER } from "../poster";
import React, { useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Bottom } from "../../landing";
import { motion } from "framer-motion";
import { Pulse } from "react-svg-spinners";

export const chunk_size =
  window.innerWidth > 1000 ? 6 : window.innerWidth > 600 ? 4 : 3;
export const ChunkDisplay = (props: {
  items: SKINNY_RENDER[];
  hidden?: boolean;
}) => {
  const [items, setItems] = React.useState<SKINNY_RENDER[]>(
    props.items.slice(0, chunk_size * 4)
  );
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
      loader={
        // <div className="w-full flex justify-center">Chargement ...</div>
        <Pulse className="w-48" color="white" />
      }
    >
      <motion.div
        key={items.length}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={{ overflow: "hidden" }}
        className="w-full flex flex-wrap gap-2 md:gap-4 justify-center transition-all duration-500 ease-in-out"
      >
        {items.map((item, i) => (
          <PosterRenderer key={i} {...item} />
        ))}
      </motion.div>
    </InfiniteScroll>
  );
};
