interface IAudioPlayer {
	play(audioSettings: AudioSourceSettings, useSecondaryStorage: boolean): Promise<void>;
	setSinkId(sinkId: string): void;
}