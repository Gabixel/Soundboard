declare class AudioStoreManager {
    private singlePool;
    private multiPool;
    constructor(volume?: number);
    updateAudioDevice(device: MediaDeviceInfo): void;
    addAudio(audio: string | AudioGroup): void;
    addToSinglePool(path: string): void;
    addToMultiPool(audioGroup: AudioGroup): void;
    play(): Promise<void>;
    pause(): void;
    stop(): void;
    get isPlaying(): boolean;
    private playGroup;
    setVolume(value: number): void;
    private stopMultiPoolAudio;
}
