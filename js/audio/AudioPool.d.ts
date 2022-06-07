declare class AudioPool {
    private audioPool;
    add(audioGroup: AudioGroup): void;
    remove(removingItem: AudioGroup | AudioJS): void;
    play(): Promise<void>;
    pause(): void;
    stop(): void;
    set volume(value: number);
    get isPlaying(): boolean;
    get hasAudio(): boolean;
}
