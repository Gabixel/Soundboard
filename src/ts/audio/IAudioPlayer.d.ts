interface IAudioPlayer {
	play(options: AudioSourceSettings, useSecondaryStorage: boolean): Promise<void>;
	setSinkId(sinkId: string): void;
}