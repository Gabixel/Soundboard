/// <reference types="jquery" />
/// <reference types="jquery" />
declare class AudioPlayer extends LogExtend {
    private static _volume;
    private static $volumeSlider;
    private static maxSliderValue;
    private static canLogVolume;
    private static audioStore;
    private static audioDevices;
    static updateAudioDevicesList(): Promise<void>;
    static setVolumeSlider($slider: JQuery<HTMLElement>): void;
    private static initSlider;
    static addAudio(path: string, time: AudioTimings, useMultiPool?: boolean): void;
    private static tryAddAudio;
    private static storeAudio;
    private static setSinkId;
    static play(): Promise<void>;
    static pause(): void;
    static stop(): void;
    static get isPlaying(): boolean;
    static get volume(): number;
    private static updateVolume;
    private static updateExistingVolumes;
}
