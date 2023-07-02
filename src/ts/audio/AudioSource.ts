/**
 * The actual audio, containing a {@link HTMLAudioElement} connected to an {@link AudioContext}.
 */
class AudioSource extends EventTarget implements IAudioController {
	private _src: string;
	private _audio: HTMLAudioElement;
	private _sourceNode: MediaElementAudioSourceNode;
	private _output: AudioOutput;

	/**
	 * Timings for the audio. Can be undefined.
	 */
	private _audioTimings: AudioTimings;

	//#region Volume
	/**
	 * Volume control for our audio.
	 */
	private _gainNode: GainNode;

	public get volume(): number {
		return this._gainNode.gain.value;
	}
	public set volume(v: number) {
		this._gainNode.gain.value = v;
	}
	//#endregion

	constructor(
		output: AudioOutput,
		options?: { src?: string; audioTimings?: AudioTimings, autoPlay?: boolean }
	) {
		super();

		this._src = options?.src;

		this._audio = new Audio(this._src);
		this._audio.preload = "";
		this._audio.autoplay = options.autoPlay ?? false

		this._output = output;

		// this.setAudioTimings(options.audioTimings);

		this._gainNode = this._output.generateEffect("GainNode");
		this._output.connectNode(this._gainNode);

		this.createSourceNode();

		this.initEventListeners();
	}

	public async play(): Promise<void> {
		if (this._src == null) {
			// Logger.logError(this.play, "Audio source is null");
			return;
		}

		this._audio.play();
	}

	public pause(): this {
		this._audio.pause();

		return this;
	}

	public get paused(): boolean {
		return this._audio.paused;
	}

	public get playing(): boolean {
		return !this._audio.paused;
	}

	public get ended(): boolean {
		return this._audio.ended;
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

	private createSourceNode(): void {
		// Generate node
		this._sourceNode = this._output.createMediaElementSource(this._audio);

		// Connect node to audio context
		this._sourceNode.connect(this._gainNode);
	}

	private initEventListeners(): void {
		$(this._audio)
			.on("ended", () => this.triggerEvent("ended"))
			.on("canplay", () => this.triggerEvent("canplay"))
			.on("error", () => this.triggerEvent("error"));
	}

	private triggerEvent(eventName: string): void {
		this.dispatchEvent(new Event(eventName));
	}
}
