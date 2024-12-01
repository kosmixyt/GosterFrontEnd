import React, { useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { chunk_size } from "../component/chunked_display/display";
import _ from "lodash";
import { toast } from "react-toastify";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Accordion, AccordionTab } from "primereact/accordion";
import { createPortal } from "react-dom";
import { app_url } from "..";

export interface IptvChannel {
  Name: string;
  Logo_url: string;
  GroupName: string;
  TRANSCODE_URL: string;
  Id: number;
}
export interface IptvProvider {
  ID: number;
  MaxStreamCount: number;
  CurrentStreamCount: number;
  FileName: string;
  Groups: string[];
  ChannelCount: number;
}

function AddIptv(url: string) {
  fetch(`${app_url}/iptv/add?url=${encodeURIComponent(url)}`, {
    method: "GET",
    credentials: "include",
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.error != undefined) {
        toast.error(res.error);
      } else {
        toast.success("Iptv added");
      }
    });
}

export function UnorderedIptv() {
  const router = useNavigate();
  const [providers, setProviders] = React.useState<IptvProvider[]>([]);
  const [url, setUrl] = React.useState("");
  useEffect(() => {
    fetch(`${app_url}/iptv/ordered`, {
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 401) {
          return (document.location.href = "/login");
        }
        return res.json();
      })
      .then((res) => setProviders(res.iptvs));
  }, []);
  const goto = (id: number, g: string) => {
    router(`/providers/${id}?group=${encodeURIComponent(g)}`);
  };
  return (
    <div className="mt-20 w-full flex justify-center">
      <div className="w-11/12">
        <h1 className="text-4xl">Iptvs Providers</h1>
        <div className="flex">
          <div className="">Add Iptv (url) : </div>
          <input
            value={url}
            onInput={(e) => setUrl((e.target as any).value)}
            type="url"
          />
          <button
            onClick={() => {
              AddIptv(
                (document.querySelector("input") as HTMLInputElement).value
              );
            }}
          >
            Add
          </button>
        </div>

        <Accordion activeIndex={0}>
          {providers.map((provider, i) => (
            <AccordionTab header={provider.FileName}>
              <div className="">
                {provider.Groups.map((group, j) => (
                  <div onClick={() => goto(provider.ID, group)}>{group}</div>
                ))}
              </div>
            </AccordionTab>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
export function Iptv() {
  const router = useNavigate();
  const params = useParams();
  const sparams = new URLSearchParams(document.location.search);
  var g = sparams.get("group") != null ? `&group=${sparams.get(`group`)}` : "";
  const [channels, setChannels] = React.useState<IptvChannel[]>([]);
  React.useEffect(() => {
    fetch(`${app_url}/iptv?id=${params.id}&limit=80${g}`, {
      credentials: "include",
    })
      .then((res) => {
        if (res.status == 401) {
          return (document.location.href = "/login");
        }
        return res.json();
      })
      .then((res) => setChannels(res.channels));
  }, []);
  return (
    <div className="mt-20 text-white">
      <InfiniteScroll
        dataLength={channels.length}
        next={() => {
          console.log("next");
          fetch(`${app_url}/iptv?id=1&offset=${channels.length}&limit=40${g}`, {
            credentials: "include",
          })
            .then((res) => {
              if (res.status == 401) {
                return (document.location.href = "/login");
              }
              return res.json();
            })
            .then((res) => {
              if (res.error != undefined) {
                toast.error(res.error);
                return router("/");
              }
              if (res.channels.length == 0) {
                return;
              }
              setChannels([...channels, ...res.channels]);
            });
        }}
        hasMore={true}
        loader={<h4>Loading...</h4>}
      >
        <div className="">
          {_.chunk(channels, chunk_size).map((channel, i) => (
            <div className="flex justify-center">
              {channel.map((channel, j) => (
                <IptvBackdrop key={j} channel={channel} />
              ))}
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
}
export function IptvBackdrop(props: { channel: IptvChannel }) {
  const router = useNavigate();
  const transcode = () => {
    router(`/player/?transcode=${props.channel.TRANSCODE_URL}`);
  };

  return (
    <div onClick={transcode} className="w-1/2 h-1/2 flex justify-center">
      <div>
        <img
          className="rounded-lg h-[128px]  w-[128px] m-auto"
          src={props.channel.Logo_url}
        />
        <div className="text-center underline font-bold">
          {MoreLength(props.channel.Name, 20)}
        </div>
      </div>
    </div>
  );
}
function MoreLength(s: string, l: number) {
  return s.length > l ? s.substring(0, l) + "..." : s;
}
