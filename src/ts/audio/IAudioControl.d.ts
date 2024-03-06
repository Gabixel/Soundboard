/**
 * Audio controls (e.g. play/pause, volume, etc.)
 */
interface IAudioControls {
	/**
	 * Custom audio source handling.
	 */
	betterSrc: string;

	/**
	 * Audio timings settings.
	 */
	audioTimings: AudioTimings;

	loop: boolean;

	volume: float;

	// TODO: playbackRate: number;

	// TODO: effects

	changeTrack(src: string): void;

	/**
	 * Starts/Resumes the audio (if there's a source file).
	 */
	play(): Promise<void>;

	/**
	 * Pauses the audio.
	 */
	pause(): void;

	/**
	 * Forcibly ends the audio (if there's a source file).
	 */
	end(): Promise<void>;

	/**
	 * Seeks to a specific timestamp in the audio.
	 *
	 * @param time The timestamp **in milliseconds**.
	 * @returns `true` whether the audio has seeked to the specified time. `false` otherwise.
	 */
	seekTo(time: number): boolean;

	restart(autoplay: boolean): Promise<void>;

	playing: boolean;

	paused: boolean;

	ended: boolean;
}
