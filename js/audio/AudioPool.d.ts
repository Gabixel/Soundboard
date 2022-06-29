declare class AudioPool extends LogExtend {
    private audioPool;
    add(group: AudioPoolGroup): void;
    remove(removingGroup: AudioPoolGroup): void;
    play(): Promise<void>;
    pause(): void;
    stop(): void;
    set volume(value: number);
    get isPlaying(): boolean;
    get length(): number;
    get multiLength(): number;
    get hasAudio(): boolean;
}
