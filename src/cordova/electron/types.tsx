export interface FFPROBE_STREAM {
  index: number;
  codec: string;
  longCodec: string;
  profile: string;
  codecType: string;
  codecTag: string;
  codecTagString: string;
  width: number;
  height: number;
  channels: number;
  channelLayout: string;
  bitsPerSample: number;
  codecWidth: number;
  codecHeight: number;
  closedCaptions: number;
  filmGrain: number;
  hasBFrames: number;
  sampleAspectRatio: string;
  displayAspectRatio: string;
  pixFmt: string;
  level: number;
  colorRange: string;
  chromaLocation: string;
  refs: number;
  rFrameRate: string;
  avgFrameRate: string;
  timeBase: string;
  startPts: number;
  startTime: string;
  extrataDataSize: number;
  disposition: FFPROBE_STREAM_DISPOSITION;
  tags: FFPROBE_TAG_STREAM;
}

export interface FFPROBE_DATA {
  streams: FFPROBE_STREAM[];
  format: FFPROBE_FORMAT;
  chapters: FFPROBE_CHAPTER[];
}

export interface FFPROBE_TAG_STREAM {
  language: string;
  title: string;
}

export interface FFPROBE_STREAM_DISPOSITION {
  default: number;
  dub: number;
  original: number;
  comment: number;
  lyrics: number;
  karaoke: number;
  forced: number;
  hearingImpaired: number;
  visualImpaired: number;
  cleanEffects: number;
  attachedPic: number;
  timedThumbnails: number;
  captions: number;
  descriptions: number;
  metadata: number;
  dependent: number;
  stillImage: number;
}

export interface FFPROBE_FORMAT {
  filename: string;
  nbStreams: number;
  nbPrograms: number;
  formatName: string;
  formatLongName: string;
  startTime: string;
  duration: string;
  size: string;
  bitRate: string;
  probeScore: number;
  tags: FFPROBE_TAGS;
}

export interface FFPROBE_TAGS {
  title: string;
  encoder: string;
  creationTime: string;
}

export interface FFPROBE_CHAPTER {
  // Add properties here if needed
}
