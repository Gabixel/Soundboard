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
	 * @param seekTime The timestamp.
	 * @param isMilliseconds Whether the timestamp is in milliseconds or not (to adapt the {@link time} value).
	 * @returns `true` whether the audio has seeked to the specified time. `false` otherwise.
	 */
	seekTo(seekTime: number, isMilliseconds: boolean): boolean;

	restart(autoplay: boolean): Promise<void>;

	playing: boolean;

	paused: boolean;

	ended: boolean;
}
