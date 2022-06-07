declare class AudioPlayer {
    private static _volume;
    private static audioStore;
    private static audioDevices;
    static updateAudioDevicesList(): Promise<void>;
    static addAudio(path: string, useMultiPool?: boolean): void;
    private static tryAddAudio;
    private static storeAudio;
    private static setAudioDevice;
    static play(): Promise<void>;
    static pause(): void;
    static stop(): void;
    static get isPlaying(): boolean;
    static get volume(): number;
    static set volume(value: number);
    private static updateExistingVolumes;
    static setPan(pan: number): void;
}
