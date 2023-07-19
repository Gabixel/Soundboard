/**
 * Audio controls (e.g. play/pause, volume, etc.)
 */
interface IAudioController {
	/**
	 * Audio source.
	 */
	src: string;

	/**
	 * TODO: Audio timings settings.
	 */
	audioTimings: AudioTimings;

	loop: boolean;

	volume: number;

	// TODO:
	// playbackRate: number;

	// TODO: effects

	changeAudio(src: string): void;

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

	seekTo(time: number): void;

	restart(): void;

	playing: boolean;

	/**
	 * If the audio is currently paused or not.
	 */
	paused: boolean;

	ended: boolean;
}
