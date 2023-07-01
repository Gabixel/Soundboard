/**
 * The actual audio, containing a {@link HTMLAudioElement} connected to an {@link AudioContext}.
 */
class AudioSource extends Logger {
	private _src: string;
	private _audio: HTMLAudioElement;

	private _sourceNode: MediaElementAudioSourceNode;
	private _sharedAudioContext: AudioContext;

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

	constructor(audioContext: AudioContext, options?: { src?: string; audioTimings?: AudioTimings }) {
		super();

		this._src = options.src;

		this._audio = new Audio(this._src);

		this._sharedAudioContext = audioContext;

		this.setAudioTimings(options.audioTimings);

		this._gainNode = this._sharedAudioContext.createGain();
		this._gainNode.connect(this._sharedAudioContext.destination);

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

	// public applyFilters(filters???): this {

	// }

	/**
	 * Attempts to switch the given output device id.
	 * 
	 * @param sinkId The new output device id
	 */
	public async setSinkId(_sinkId: string): Promise<void> {
		await this._sharedAudioContext.setSinkId(_sinkId);
	}

	// TODO: y' know.. timings
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
		this._sourceNode = this._sharedAudioContext.createMediaElementSource(this._audio);

		// Connect node to audio context
		this._sourceNode.connect(this._gainNode);
	}
}
