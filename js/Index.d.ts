declare type AudioJS = HTMLAudioElement & {
    setSinkId(deviceId: string): Promise<undefined>;
    sinkId: string;
};
declare type AudioGroup = {
    main: AudioJS;
    playback: AudioJS;
    lastTrack?: string;
    forcedEnding?: boolean;
};
declare type SoundButtonData = {
    title: string;
    color: {
        h: number;
        s: number;
        l: number;
    };
    image: string;
    tags: string[];
    path: string;
    index: number;
};
