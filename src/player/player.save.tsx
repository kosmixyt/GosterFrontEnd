//@ts-nocheck
export class Player extends React.Component<PlayerProps> {
    container: React.RefObject<HTMLDivElement> = React.createRef();
    state: {
        miniOpen: boolean;
        showAsked: boolean;
    };
    uuid: string;
    AvailableQuality: QUALITY[] = [];
    static CURSOR_TIMEOUT = 3000;
    CURRENT_TRACK: Track = this.props.data.tracks[0]
    CURRENT_QUALITY: QUALITY = this.props.data.qualitys[0]
    AvailableTracks: Track[] = [];
    AvailableSubs: Subtitle[] = [];
    video: React.RefObject<HTMLVideoElement> = React.createRef();
    playBar: React.RefObject<HTMLDivElement> = React.createRef();
    playPauseBtn = React.createRef<HTMLImageElement>();
    hidetimeout: NodeJS.Timeout | null = null;
    timeline: React.RefObject<HTMLInputElement> = React.createRef();
    timeUpdate = React.createRef<HTMLDivElement>();
    fullscreen = React.createRef<HTMLImageElement>();
    hls: Hls = new Hls();
    settings = React.createRef<HTMLImageElement>();
    inited = false;
    constructor(props: PlayerProps) {
        document.title = `${props.data.name} - Player`;
        console.log(props);
        super(props);
        this.uuid = props.data.uuid;
        this.AvailableQuality = props.data.qualitys;
        this.AvailableSubs = props.data.subtitles;
        this.AvailableTracks = props.data.tracks;
        this.state = {
            showAsked: this.props.data.current > 0,
            miniOpen: false,
        };
    }
    newHlsPlayer(setTimeStamp: number) {
        this.hls = new Hls(
            this.props.data.isLive
                ? {
                    // enableWorker: true,
                    // liveBackBufferLength: 0,
                    // liveDurationInfinity: true,
                    // liveSyncDuration: 1,
                    // highBufferWatchdogPeriod: 1,
                }
                : {}
        );
        this.hls.config.xhrSetup = this.xhrSetup.bind(this);
        // this.hls.config.maxBufferLength = 8;

        if (setTimeStamp !== 0) {
            this.hls.config.startPosition = setTimeStamp;
        }
        if (!this.inited) {
            this.inited = true;
        }
        this.hls.loadSource(app_url + this.props.data.manifest);
        this.hls.attachMedia(this.video.current as HTMLVideoElement);
        this.hls.on(Hls.Events.ERROR, (e: string, b: ErrorData) => {
            if (b.fatal) {
                this.hls.destroy();
                this.newHlsPlayer(this.props.data.current);
            }
            console.log(e, b)
        });
        this.video.current!.play().catch(() => { });
    }
    componentDidMount() {
        // document.body.style.backgroundColor = "black";
        document.body.style.overflowY = "hidden";
        if (!Hls.isSupported()) {
            console.log("hls not supported");
        }
        if (this.props.data.current === 0) {
            this.newHlsPlayer(0);
            setTimeout(() => {
                this.video.current?.play().catch((e) => { });
            }, 2000);
        } else {
            this.setState({ showAsked: true });
            this.video.current?.play().catch((e) => { });
        }
        // this.newHlsPlayer(0);
        for (var i = 0; i < this.video.current!.textTracks.length; i++) {
            const textTrack = this.video.current!.textTracks[i];
            textTrack.mode = "hidden";
        }
        this.hidetimeout = setTimeout(() => {
            // document.body.style.cursor = "none";
            this.hideTimeline();
        }, Player.CURSOR_TIMEOUT);
        document.addEventListener("keydown", this.KeyInputElement.bind(this));
        this.video.current?.addEventListener(" ended", this.onEnded.bind(this));
    }
    onEnded() {
        console.log("ended");
        // if (!this.NextFile.Uuid) return;
        // document.location.href = `/play/${this.NextFile.ItemType}/${this.NextFile.Uuid}`;
    }
    KeyInputElement(e: KeyboardEvent) {
        if (!this.playBar.current || !this.video.current) return () => { };
        var videoTime = this.video.current.currentTime;
        if (e.key === "ArrowRight") {
            this.video.current.currentTime = videoTime + 10;
        }
        if (e.key === "ArrowLeft") {
            this.video.current.currentTime = videoTime - 10;
        }
        if (e.code === "Space") {
            this.inversePlay(false);
        }
    }
    private downloaded_bytes = 0;
    private start_time = Date.now();
    xhrSetup(xhr: XMLHttpRequest, url: string) {
        xhr.withCredentials = true;
        xhr.addEventListener("load", (e) => {
            this.downloaded_bytes += e.loaded;
        });
        if (url.includes("m3u8")) return;
        xhr.setRequestHeader("X-QUALITY", this.CURRENT_QUALITY.Name);

        if (this.AvailableTracks.length > 0) xhr.setRequestHeader("X-TRACK", this.CURRENT_TRACK.Index.toString());
    }

    hideTimeline() {
        if (!this.playBar.current) return;
        this.playBar.current.style.opacity = "0";
    }
    showNextPoster() {
        console.log("show");
        this.setState({ nextPoster: true });
    }
    hideNextPoster() {
        console.log("hide");
        this.setState({ nextPoster: false });
    }
    setNewQuality(quality: QUALITY) {
        if (!this.video.current) return;
        this.CURRENT_QUALITY = quality
        this.setState({
            miniOpen: false,
        })
    }
    setNewTrack(track: Track) {
        if (!this.video.current) return;
        this.CURRENT_TRACK = track
        const time = this.video.current.currentTime;
        this.hls.destroy();
        this.newHlsPlayer(time);
        this.video.current.play().catch((e) => { });
        this.setState({
            miniOpen: false,
        })
    }
    setNewSubtitle(subtitle: Subtitle | null) {
        for (var i = 0; i < this.video.current!.textTracks.length; i++) {
            const textTrack = this.video.current!.textTracks[i];
            textTrack.mode = "hidden";
        }
        if (!subtitle) return;
        const track = this.video.current!.textTracks[subtitle.Index];
        track.mode = "showing";
    }
    componentWillUnmount(): void {
        document.removeEventListener("keydown", this.KeyInputElement);
        this.video.current?.removeEventListener("ended", this.onEnded);
        this.hls.destroy();
        document.body.style.overflowY = "auto";
        fetch(`${app_url}/transcode/stop/${this.uuid}`, {
            credentials: "include",
        })
            .then((data) => data.json())
            .then((data) => console.log(data));
    }
    resetHideTimeout() {
        if (this.hidetimeout === null || !this.playBar.current) return;
        clearTimeout(this.hidetimeout);
        // document.body.style.cursor = "auto";
        this.hidetimeout = setTimeout(() => this.hideTimeline(), Player.CURSOR_TIMEOUT);
        this.playBar.current.style.opacity = "1";
    }
    videoLoad() {
        if (!this.timeline.current) throw new Error("wsh");
        this.timeline.current.max = (this.video.current?.duration as number).toFixed(3).toString() as string;
    }
    public SynRangeTimeout: NodeJS.Timeout | null = null;
    syncRange(type: string) {
        if (!this.timeline.current || !this.video.current) throw new Error("missing");
        if (type === SYNC.BAR) {
            this.timeline.current.value = this.video.current.currentTime.toFixed(3).toString() as string;
            this.setTime();
        } else {
            if (this.SynRangeTimeout != null) {
                console.log("clearing");
                clearTimeout(this.SynRangeTimeout);
            }
            const NewTime = (this.video.current.currentTime = parseFloat(this.timeline.current.value));
            this.SynRangeTimeout = setTimeout(() => {
                console.log("setting");
                if (!this.timeline.current || !this.video.current) throw new Error("missing");
                this.video.current.currentTime = NewTime;
                this.setTime();
            }, 300);
        }
    }
    setTime() {
        if (!this.timeUpdate.current || !this.video.current) throw new Error("missing");
        this.timeUpdate.current.innerText = `${secondsToHms(this.video.current?.currentTime as number)}  /  ${!this.props.data.isLive ? secondsToHms(this.video.current?.duration as number) : "LiveStream 🔴"
            }`;
    }
    videoEnd() {
        if (!this.timeline.current || !this.video.current) {
            throw new Error("missing");
        }
        this.timeline.current.value = this.timeline.current.max;
    }
    async pauseHandler() {
        if (!this.playPauseBtn.current) return;
        this.playPauseBtn.current.src = play;
    }
    async playHandler() {
        if (!this.playPauseBtn.current) return;
        this.playPauseBtn.current.src = pause;
    }
    inversePlay(preventAnimation: boolean) {
        if (!this.video.current) return;
        this.video.current.paused ? this.video.current.play().catch((e) => console.log(e)) : this.video.current.pause();
    }
    inverseFullscreen() {
        if (!this.container.current) return;
        if (!this.fullscreen.current) return;
        if (document.fullscreenElement) {
            document.exitFullscreen();
            this.fullscreen.current.src = fullscreen;
        } else {
            this.container.current.requestFullscreen().catch((e) => console.log(e));
            this.fullscreen.current.src = fullscreenExit;
        }
    }

    render() {
        console.log("render");
        return (
            <div onMouseMove={() => this.resetHideTimeout()} className="allcontainer">
                <div className="w-screen h-screen flex align-middle justify-center" ref={this.container}>
                    <video
                        crossOrigin="use-credentials"
                        onTimeUpdate={() => this.syncRange(SYNC.BAR)}
                        onLoadedData={() => this.videoLoad()}
                        onPlay={() => this.playHandler()}
                        onPause={() => this.pauseHandler()}
                        onEnded={() => this.videoEnd()}
                        onClick={() => this.inversePlay(false)}
                        poster={this.props.data.backdrop}
                        autoPlay={false}
                        className="bg-black rounded-md w-full h-full relative"
                        ref={this.video}
                    >
                        {this.AvailableSubs.map((e) => (
                            <track key={e.Index} label={e.Name} srcLang={e.Name} kind="subtitles" src={`${app_url}/transcode/${this.uuid}/subtitle/${e.Index}`} />
                        ))}
                    </video>
                    <Dialog onHide={() => { }} visible={this.state.showAsked} header="Reprendre du début ?">
                        Nous avons détecté que vous avez quitté la vidéo avant la fin, voulez-vous reprendre du début ?
                        <br />
                        Dans 5 secondes la vidéo reprendra automatiquement de la ou vous l'avez quitté.
                        <br />
                        <div style={{ marginTop: "20px", display: "flex", gap: "20px" }}>
                            <Button
                                onClick={() => {
                                    this.setState({ showAsked: false });
                                    this.newHlsPlayer(0);
                                }}
                                label="Reprendre de 0"
                            />
                            <Button
                                onClick={() => {
                                    this.setState({ showAsked: false });
                                    this.newHlsPlayer(this.props.data.current);
                                    console.log(this.state.showAsked);
                                }}
                                label={`Continuer à ${FormatRuntime(this.props.data.current / 60)}`}
                            />
                        </div>
                    </Dialog>
                    <div ref={this.playBar} className="z-20 bottom-0 absolute w-full">
                        <div className="block">
                            <div className="mt-8 flex justify-center">
                                <input
                                    hidden={this.props.data.isLive}
                                    // style={{ pointerEvents: "none" }}
                                    title="timeline"
                                    step={0.01}
                                    onChange={() => this.syncRange(SYNC.VIDEO)}
                                    ref={this.timeline}
                                    type="range"
                                    className="w-97% h-4"
                                />
                            </div>
                            <div className="flex pt-2 pl-8">
                                <div style={{ display: "flex" }}>
                                    <img title="PLay button" ref={this.playPauseBtn} onClick={() => this.inversePlay(true)} className="w-10" src={play} />
                                </div>
                                <div className="ml-2 flex">
                                    <img title="timestamp" className="w-10" src={volume} />
                                    <div ref={this.timeUpdate} className="text-3xl mt-1 mb-2 ml-4 text-white">
                                        00:00/20:00
                                    </div>
                                </div>
                                <div className="right-icons">
                                    {this.state.miniOpen ? (
                                        <MiniModal settings={this.settings} player={this} close={() => this.setState({ miniOpen: false })} />
                                    ) : (
                                        <></>
                                    )}
                                    <div>
                                        <span className="left-5 -top-2 absolute text-white text-xs bg-red-600 rounded-md ">
                                            &nbsp;
                                            {this.AvailableQuality.length > 0 ? this.CURRENT_QUALITY.Name.slice(0, 7) : "None"}
                                            &nbsp;
                                        </span>
                                        {this.AvailableTracks.length > 0 ? (
                                            <span className="-left-4 -top-3 absolute text-white text-xs rounded-md ml-4 mt-2 bg-red-600">
                                                &nbsp;
                                                {this.CURRENT_TRACK.Name.length > 0 ? this.CURRENT_TRACK.Name.slice(0, 3) : "UKN"}
                                                &nbsp;
                                            </span>
                                        ) : (
                                            <></>
                                        )}
                                        <img
                                            title="settings"
                                            ref={this.settings}
                                            onClick={() => this.setState({ miniOpen: !this.state.miniOpen })}
                                            src={code}
                                            className="w-10 ml-6"
                                            style={{ marginRight: "7px", marginBottom: "2px" }}
                                        />
                                    </div>
                                    <img title="fullscreen" onClick={() => this.inverseFullscreen()} ref={this.fullscreen} className="btn-ic" src={fullscreen} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}