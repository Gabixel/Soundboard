/**
 * Audio controls (e.g. play/pause, volume, etc.)
 */
interface IAudioController {
	/**
	 * Starts the audio (if there's a source file).
	 */
	play(): Promise<void>;

	/**
	 * Pauses the audio.
	 */
	pause(): this;

	/**
	 * If the audio is currently paused or not.
	 */
	paused: boolean;

	playing: boolean;

	ended: boolean;

	/**
	 * The audio volume.
	 */
	volume: number;
}
