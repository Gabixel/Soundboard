declare class AudioStoreManager extends LogExtend {
    private singlePool;
    private multiPool;
    constructor(volume?: number);
    updateAudioDevice(device: MediaDeviceInfo): void;
    addToSinglePool(path: string, time: AudioTimings): void;
    addToMultiPool(audioGroup: AudioPoolGroup): void;
    play(): Promise<void>;
    pause(): void;
    stop(): void;
    get isPlaying(): boolean;
    private playGroup;
    setVolume(value: number): void;
    private stopMultiPoolAudio;
}
