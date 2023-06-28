/**
 * The actual audio, containing a {@link HTMLAudioElement} connected to an {@link AudioContext}.
 */
class AudioSource extends Logger {
	private _src: string;
	private _audio: HTMLAudioElement;

	private _sourceNode: MediaElementAudioSourceNode;
	private _audioContext: AudioContext;

	/**
	 * Timings for the audio. Can be undefined.
	 */
	private _audioTimings: AudioTimings;

	//#region Volume
	/**
	 * Volume control for our audio.
	 */
	private _gainNode: GainNode;

	/**
	 * The audio volume.
	 */
	public get volume(): number {
		return this._gainNode.gain.value;
	}
	/**
	 * The audio volume.
	 */
	public set volume(v: number) {
		this._gainNode.gain.value = v;
	}
	//#endregion

	// TODO: filters class?

	constructor(options?: { src?: string; audioTimings?: AudioTimings }) {
		super();

		this._src = options.src;

		this._audio = new Audio(this._src);

		this._audioContext = new AudioContext({
			latencyHint: "interactive", // This option indicates that low audio processing latency is important, such as for real-time interactive applications like games or music applications where immediate audio response is critical
		});

		this.setAudioTimings(options.audioTimings);

		this._gainNode = this._audioContext.createGain();
		this._gainNode.connect(this._audioContext.destination);

		if (this._src) {
			this.regenerateSourceNode();
		}
	}

	/**
	 * Starts the audio. Creates the audio node if missing.
	 */
	public play(): this {
		if (!this._src) {
			return this;
		}

		if (this._sourceNode == null) {
			// Generate the source node if it's missing
			this.regenerateSourceNode();
		}

		this._audio.play();

		return this;
	}

	public pause(): this {
		this._audio.pause();

		return this;
	}

	// public changeTrack(
	// 	src: string,
	// 	keepPreviousTimings?: boolean,
	// 	newTimings?: AudioTimings
	// ): void {}

	/**
	 * Attempts to change audio output device with the given id. **Note:** It needs to regenerate the audio, so a silence break is expected.
	 * @param sinkId The new output devcie id
	 */
	public async setSinkId(sinkId: string): Promise<void> {
		const wasPlaying =
			!this._audio.paused &&
			// See https://stackoverflow.com/a/9444425/16804863#comment15548542_9444425
			StringUtilities.isDefined(this._src);

		if (wasPlaying) {
			// Keep current track position if it was playing
			this.pause();
		}

		// Since the next instruction uninevitably needs to recreate
		// the source node, we need to remove the previous one
		this.destroySourceNode();

		// Set new id
		await this._audio.setSinkId(sinkId);

		// Then generate a new source node to play to the new output device
		this.regenerateSourceNode();

		if (wasPlaying) {
			// Resume if it was playing
			this.play();
		}
	}

	// todo: y' know.. timings
	private setAudioTimings(audioTimings: AudioTimings): void {
		this._audioTimings = audioTimings;
	}

	/**
	 * Disconnects the source node from the gain one and deallocates the former.
	 */
	private destroySourceNode(): void {
		this._sourceNode.disconnect(this._gainNode);
		this._sourceNode = null;
	}

	private regenerateSourceNode(): void {
		// Generate node
		this._sourceNode = this._audioContext.createMediaElementSource(this._audio);

		// Connect node to audio context
		this._sourceNode.connect(this._gainNode);
	}
}
