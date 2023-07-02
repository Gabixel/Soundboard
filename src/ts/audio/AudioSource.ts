/**
 * The actual audio, containing a {@link HTMLAudioElement} connected to an {@link AudioContext}.
 */
class AudioSource extends EventTarget implements IAudioController {
	private _audio: HTMLAudioElement;
	private _sourceNode: MediaElementAudioSourceNode;
	private _output: AudioOutput;

	private _destroyed: boolean = false;

	/**
	 * Audio source.
	 */
	private _src: string;
	public get src(): string {
		return this._src;
	}

	/**
	 * Audio timings settings.
	 */
	private _audioTimings: AudioTimings;
	public get audioTimings(): AudioTimings {
		return this._audioTimings;
	}

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
		options?: { src?: string; audioTimings?: AudioTimings },
		autoPlay?: boolean
	) {
		super();

		this._src = options?.src;

		this._audio = new Audio(this._src);
		this._audio.preload = "metadata";
		this._audio.autoplay = autoPlay ?? true;

		this._output = output;

		// this.setAudioTimings(options.audioTimings);

		this._gainNode = this._output.generateEffect("GainNode");
		this._output.connectNode(this._gainNode);

		this.createSourceNode();

		this.initEventListeners();
	}

	public async play(): Promise<void> {
		if (this._src == null || this._destroyed) {
			// Logger.logError(this.play, "Audio source is null");
			return;
		}

		this._audio.play().then(() => {
			// Trigger resume event after starting/resuming
			this.triggerEvent("resume");
		});
	}

	public pause(): this {
		if (this._destroyed) {
			return this;
		}

		this._audio.pause();

		return this;
	}

	public seekTo(time: number): this {
		if (this._src == null || this._destroyed) {
			// Logger.logError(this.play, "Audio source is null");
			return this;
		}

		this._audio.currentTime = time;
		return this;
	}

	public restart(): this {
		this.seekTo(0);
		return this;
	}

	public end(): this {
		this.seekTo(this._audio.duration);
		return this;
	}

	public get playing(): boolean {
		return !this.paused && !this.ended;
	}

	public get paused(): boolean {
		return this._audio.paused;
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
	// private setAudioTimings(audioTimings: AudioTimings): void {
	// 	this._audioTimings = audioTimings;
	// }

	private createSourceNode(): void {
		// Generate node
		this._sourceNode = this._output.createMediaElementSource(this._audio);

		// Connect node to audio context
		this._sourceNode.connect(this._gainNode);
	}

	private destroy(): void {
		this._destroyed = true;

		this._gainNode.disconnect();
		this._sourceNode.disconnect();
		this._gainNode = this._sourceNode = null;

		this._audio.srcObject = null;
		this._audio = null;
	}

	private initEventListeners(): void {
		$(this._audio)
			.on("error", () => {
				this.destroy();
				this.triggerEvent("error");
			})
			.on("ended", () => {
				this.destroy();
				this.triggerEvent("ended");
			})
			.on("pause", () => {
				// Trigger pause event only when it just paused
				if (!this.ended) {
					this.triggerEvent("pause");
				}
			})
			.on("canplay", () => {
				this.triggerEvent("canplay");
			});
	}

	private triggerEvent(eventName: string): void {
		this.dispatchEvent(new Event(eventName));
	}
}
