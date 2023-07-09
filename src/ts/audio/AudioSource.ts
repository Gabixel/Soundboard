/**
 * The actual audio, containing a {@link HTMLAudioElement} connected to an {@link AudioContext}.
 */
class AudioSource extends EventTarget implements IAudioController {
	private _audio: HTMLAudioElement;
	private _sourceNode: MediaElementAudioSourceNode;
	private _output: AudioOutput;

	/**
	 * If we want to preserve this source on end (for re-use). Else, use {@link _destroyed}.
	 */
	private _preserve: boolean;

	private _destroyed: boolean = false;

	/**
	 * Audio source. We store it separately because if {@link Audio}'s `src` is not set, it will point to its document.
	 */
	private _audioSrc: string;
	public get src(): string {
		return this._audioSrc;
	}

	/**
	 * Audio timings settings.
	 */
	private _audioTimings: AudioTimings;
	public get audioTimings(): AudioTimings {
		return this._audioTimings;
	}

	constructor(
		output: AudioOutput,
		options?: AudioSourceOptions,
		autoPlay?: boolean,
		preserveOnEnd?: boolean
	) {
		super();

		this._audio = new Audio();
		this._audio.preload = "metadata";
		this._audio.autoplay = autoPlay ?? true;
		this._audio.loop = false;

		this._output = output;

		this._preserve = preserveOnEnd;

		// this.setAudioTimings(options.audioTimings);
		// for now:
		this._audioTimings = options?.audioTimings;

		this.createSourceNode();

		this.initEventListeners();

		this.changeAudio(options?.src);
	}

	public changeAudio(src: string): void {
		if (this._destroyed) {
			return;
		}

		this._audioSrc = src ?? undefined;
		if (this.src) {
			this._audio.src = src;
			this._audio.load();
		}
	}

	public async play(): Promise<void> {
		if (!this.src) {
			console.log("Audio has no src, play has been prevented");
			
			return;
		}

		if (this._destroyed) {
			Logger.logError(this.play, "Can't resume: audio is destroyed");
			return;
		}

		this._audio.play();
	}

	public pause(): this {
		if (this._destroyed) {
			return this;
		}

		this._audio.pause();

		return this;
	}

	public seekTo(time: number): this {
		if (!this.src) {
			console.log("Audio has no src, play has been prevented");

			return this;
		}

		if (this._destroyed) {
			Logger.logError(this.play, "Can't resume: audio is destroyed");

			return this;
		}

		this._audio.currentTime = time;
		return this;
	}

	public restart(): this {
		this.seekTo(0);
		this.play();
		return this;
	}

	public end(): this {
		this.seekTo(this._audio.duration);
		$(this._audio).trigger("end");

		return this;
	}

	public get playing(): boolean {
		return !this._audio.paused && !this._audio.ended;
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
		// Generate source node
		this._sourceNode = this._output.createMediaElementSource(this._audio);

		// Connect source node to audio context
		this._output.connectNode(this._sourceNode);
	}

	private initEventListeners(): void {
		$(this._audio)
			.on("error", (_e) => {
				console.log("error");

				if (this._audio.srcObject == null) {
					return;
				}

				console.error("error", _e);

				if (!this._preserve) {
					console.log("destroying");

					this.destroy();
				}

				this.triggerEvent("error");
			})
			.on("ended", () => {
				console.log("ended");

				if (!this._preserve) {
					this.destroy();
				}

				this.triggerEvent("ended");
			})
			.on("pause", () => {
				// Don't trigger pause event if the audio has ended
				if (this.ended) {
					return;
				}

				this.triggerEvent("pause");
			})
			.on("canplay", () => {
				// Don't trigger canplay if the audio has been destroyed
				if (this._destroyed) {
					return;
				}

				console.log("canplay");

				this.triggerEvent("canplay");
			});
	}

	private triggerEvent(eventName: string): void {
		this.dispatchEvent(new Event(eventName));
	}

	/**
	 * Dispose logic.
	 */
	private destroy(): void {
		this._destroyed = true;

		this._sourceNode.disconnect();
		this._sourceNode = null;

		this._audio.srcObject = null;
		this._audio = null;

		this._output = null;
	}
}
