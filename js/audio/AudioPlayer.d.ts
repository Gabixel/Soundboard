declare type AudioJS = HTMLAudioElement & {
    setSinkId(deviceId: string): Promise<undefined>;
    sinkId: string;
};
declare class AudioPlayer {
    private static _volume;
    private static audioMain;
    private static audioTree;
    private static addingAudio;
    static playAudio(path: string): void;
    private static createAudio;
    private static addAudio;
    private static prepareAudio;
    static stop(): void;
    private static removeAudio;
    static get volume(): number;
    static set volume(value: number);
    private static updateExistingVolumes;
}
