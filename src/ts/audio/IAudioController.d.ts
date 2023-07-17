/**
 * Audio controls (e.g. play/pause, volume, etc.)
 */
interface IAudioController {
	/**
	 * Audio source.
	 */
	src: string;

	/**
	 * Audio timings settings.
	 */
	audioTimings: AudioTimings;

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
	 * Ends the audio (if there's a source file).
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

	loop: boolean;
}
