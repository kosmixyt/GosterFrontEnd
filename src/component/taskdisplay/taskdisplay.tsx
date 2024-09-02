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
    const event = new EventSource(app_url + `/task?taskid=${props.task_id}`, { withCredentials: true });
    event.addEventListener("log", (e) => {
      setText((text) => text + e.data.replaceAll("\n", "<br>"));
      if (container.current && autoScroll) {
        container.current.scrollTop = container.current.scrollHeight;
      }
    });
    event.addEventListener("error", (e) => {
      event.close();
    });
    return () => {
      //   clearInterval(inter);
      event.close();
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
      className="max-w-full max-h-[90%] text-left overflow-auto text-black font-bold bg-white opacity-50"
    ></div>
  );
}
