declare type AudioJS = HTMLAudioElement & {
    setSinkId(deviceId: string): Promise<undefined>;
    sinkId: string;
};
declare type AudioGroup = {
    main: AudioJS;
    playback: AudioJS;
    lastTrack: string;
};
declare type AudioPoolGroup = {
    main: AudioJS;
    mainEnded: boolean;
    playback: AudioJS;
    playbackEnded: boolean;
    forcedEnding: boolean;
};
declare type SoundButtonData = {
    title?: string;
    color?: {
        h: number;
        s: number;
        l: number;
    };
    image?: string;
    tags?: string[];
    time?: AudioTimings;
    path?: string;
};
declare type AudioTimings = {
    start: number;
    end: number;
    condition: "at" | "after";
};
declare function init(): Promise<void>;
