/**
 * Audio controls (e.g. play/pause, volume, etc.)
 */
interface IAudioControls {
	/**
	 * Audio source.
	 */
	betterSrc: string;

	/**
	 * TODO: Audio timings settings.
	 */
	audioTimings: AudioTimings;

	loop: boolean;

	volume: float;

	// TODO:
	// playbackRate: number;

	// TODO: effects

	changeTrack(src: string): void;

	/**
	 * Starts the audio (if there's a source file).
	 */
	play(): Promise<void>;

	/**
	 * Pauses the audio.
	 */
	pause(): this;

	/**
	 * Forcibly ends the audio (if there's a source file).
	 */
	end(): void;

	/**
	 * Seeks to a specific timestamp in the audio.
	 *
	 * @param time Time (in milliseconds).
	 * @returns `true` whether the audio was seeked to the specified time. `false` otherwise.
	 */
	seekTo(time: number): boolean;

	restart(): void;

	playing: boolean;

	/**
	 * If the audio is currently paused or not.
	 */
	paused: boolean;

	ended: boolean;
}
