import React from "react";
import { Terminal } from "@xterm/xterm"
import "@xterm/xterm/css/xterm.css"
import { Buffer } from 'buffer';
import { app_url } from "../..";
import { FitAddon } from '@xterm/addon-fit';



export class PTY extends React.Component<{}> {
    public containerRef = React.createRef<HTMLDivElement>()
    public terminal = new Terminal();
    public Websocket = new WebSocket(`wss://${app_url.replace('https://', "")}/pty`,)
    public connected = false;
    public fit = new FitAddon()
    constructor(props: any) {
        super(props)
    }

    componentDidMount(): void {
        console.log("PTY mounted")
        this.terminal.loadAddon(this.fit)
        this.terminal.open(this.containerRef.current as HTMLDivElement)
        this.terminal.onData(this.on_data.bind(this))
        this.terminal.write("---- Connecting to backend ---- \r\n")
        this.Websocket.onopen = () => {
            this.terminal.write("---- Websocket connected ----\r\n")
            this.connected = true;
        }
        this.Websocket.onmessage = (event) => {
            console.log("Data received from websocket", event.data)
            this.write(event.data)
        }
        this.terminal.onResize((arg1) => {
            this.on_resize(arg1)
            console.log(arg1, "resize")
        })
        this.Websocket.onclose = this.check_alive.bind(this)
        this.fit.fit()
        setInterval(() => {
            // this.terminal.write(this.Websocket.readyState.toString())
        }, 1000)
    }
    on_resize(arg1: { cols: number, rows: number }): void {
        if (!this.connected) {
            this.terminal.write("---- Websocket not connected ----\r\n")
            return
        }
        console.log("Resize received from pty", arg1)
        this.Websocket.send(JSON.stringify({ r: `${arg1.cols} ${arg1.rows}` }))
    }
    on_data(writed: string, _: void): void {
        if (!this.connected) {
            this.terminal.write("---- Websocket not connected ----\r\n")
            return
        }
        console.log("Data received from pty", writed)
        const out = JSON.stringify({ c: writed })
        this.Websocket.send(Buffer.from(out))
    }
    write(data: string): void {
        this.terminal.write(data);
    }
    check_alive(): void {
        if (this.Websocket.readyState === this.Websocket.CLOSED) {
            window.close()
            return
        }
    }
    render(): React.ReactNode {
        return <div className="w-screen h-screen relative" ref={this.containerRef}></div>
    }
}