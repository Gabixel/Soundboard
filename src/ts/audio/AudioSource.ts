/**
 * The actual audio, containing a {@link HTMLAudioElement} connected to an {@link AudioContext}.
 */
class AudioSource extends EventTarget implements IAudioController {
	private _audio: HTMLAudioElement;
	private _sourceNode: MediaElementAudioSourceNode;
	private _audioOutput: AudioOutput;

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

	public get loop(): boolean {
		return this._audio.loop;
	}

	public set loop(loop: boolean) {
		if (!this._preserve) {
			throw new ReferenceError("Can't loop audio if 'preserve' is not enabled");
		}

		this._audio.loop = loop;
	}

	public get volume(): number {
		return this._audio.volume;
	}

	public set volume(volume: number) {
		this._audio.volume = volume;
	}

	/**
	 * Audio timings settings.
	 */
	private _audioTimings: AudioTimings;
	public get audioTimings(): AudioTimings {
		return this._audioTimings;
	}

	constructor(
		audioOutput: AudioOutput,
		options?: AudioSourceOptions,
		autoPlay?: boolean,
		preserveOnEnd?: boolean
	) {
		super();

		this._audio = new Audio();
		this._audio.preload = "metadata";
		this._audio.autoplay = autoPlay ?? true;
		this._audio.loop = false;

		this._audioOutput = audioOutput;

		this.volume = options?.volume ?? 1;

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
			console.log("Audio has no src, seekTo has been prevented");

			return this;
		}

		if (this._destroyed) {
			Logger.logError(this.play, "Can't resume: audio is destroyed");

			return this;
		}

		this._audio.currentTime = time;
		return this;
	}

	public async restart(): Promise<void> {
		this.seekTo(0);
		await this.play();
	}

	public end(): this {
		this.pause();
		this.seekTo(0);

		$(this._audio).trigger("ended");

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
		this._sourceNode = this._audioOutput.createMediaElementSource(this._audio);

		// Connect source node to audio context
		this._audioOutput.connectNode(this._sourceNode);
	}

	private initEventListeners(): void {
		$(this._audio)
			.on("error", (_e) => {
				// console.log("error");

				// if (this._audio.srcObject == null) {
				// 	return;
				// }

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

		$(this._audio).off("error ended pause canplay");

		this._sourceNode.disconnect();
		this._sourceNode = null;

		this._audio.srcObject = null;
		this._audio = null;

		this._audioOutput = null;
	}
}
