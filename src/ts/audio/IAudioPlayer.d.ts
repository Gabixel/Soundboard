interface IAudioPlayer {
	play(options: AudioSourceOptions, useSecondaryStorage: boolean): Promise<void>;
	setSinkId(sinkId: string): void;
}