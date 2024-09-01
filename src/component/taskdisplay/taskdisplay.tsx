import { Terminal } from "@xterm/xterm";
import React, { useEffect, useState } from "react";
import { app_url } from "../..";

export interface TaskData {
  ID: string;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string;
  name: string;
  logs: string;
  status: string;
  started: string;
  user_id: string;
}
export function DisplayTask(props: { task_id: string; className?: string; hidden?: boolean }) {
  const container = React.useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [text, setText] = useState("");
  useEffect(() => {
    const inter = setInterval(() => {
      fetch(app_url + `/task?taskid=${props.task_id}`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data: TaskData) => {
          setText(data.logs.replaceAll("\n", "<br>"));

          //   container.current?.scrollTo(0, container.current.scrollHeight);
        });
    }, 1000);
    return () => {
      clearInterval(inter);
    };
  }, []);
  useEffect(() => {
    if (container.current && autoScroll) {
      container.current.scrollTop = container.current.scrollHeight;
    }
  }, [text]);
  return (
    <div
      ref={container}
      hidden={props.hidden}
      dangerouslySetInnerHTML={{ __html: text }}
      className="max-w-full max-h-[90%] overflow-auto text-black font-bold bg-white opacity-50"
    ></div>
  );
}
