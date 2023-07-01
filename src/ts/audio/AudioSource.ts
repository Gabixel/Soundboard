/**
 * The actual audio, containing an {@link HTMLAudioElement} connected to an {@link AudioContext}.
 */
class AudioSource extends Logger {
	// In order of flow
	private _src: string;
	private _audio: HTMLAudioElement;
	private _sourceNode: MediaElementAudioSourceNode;

	private _output: {
		main: AudioOutput;
		// Use playback for operations (e.g. node generation)
		playback: AudioOutput;
	};

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

	constructor(
		mainOutput: AudioOutput,
		playbackOutput: AudioOutput,
		options?: { src?: string; audioTimings?: AudioTimings }
	) {
		super();

		this._src = options?.src;

		this._audio = new Audio(this._src);

		this._output = {
			main: mainOutput,
			playback: playbackOutput,
		};

		// this.setAudioTimings(options.audioTimings);

		// Generate the default gain node
		this._gainNode = playbackOutput.generateEffect("GainNode");

		// Connect audio to outputs
		mainOutput.connectNode(this._gainNode);
		playbackOutput.connectNode(this._gainNode);

		if (this._src) {
			this.regenerateSourceNode();
		}
	}

	/**
	 * Starts the audio. Creates the audio node if missing.
	 */
	public play(): this {
		if (this._src == null) {
			AudioSource.logDebug(this.play, "Audio source is null");
			return this;
		}

		if (this._sourceNode == null) {
			AudioSource.logInfo(this.play, "Audio node is null, generating…");
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

	public get paused(): boolean {
		return this._audio.paused;
	}

	// public changeTrack(
	// 	src: string,
	// 	keepPreviousTimings?: boolean,
	// 	newTimings?: AudioTimings
	// ): void {}

	// public applyFilters(filters???): this {

	// }

	// TODO: y' know.. timings
	private setAudioTimings(audioTimings: AudioTimings): void {
		this._audioTimings = audioTimings;
	}

	private regenerateSourceNode(): void {
		this.destroySourceNode();

		// Generate node
		this._sourceNode = this._output.playback.createMediaElementSource(this._audio);

		// Connect node to audio context
		this._sourceNode.connect(this._gainNode);
	}

	/**
	 * Disconnects the source node from the gain one and deallocates the former.
	 */
	private destroySourceNode(): void {
		this._sourceNode?.disconnect();
		this._sourceNode = null;
	}
}
