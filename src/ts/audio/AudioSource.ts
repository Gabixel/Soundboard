/**
 * The actual audio, containing a {@link HTMLAudioElement} connected to an {@link AudioContext}.
 */
class AudioSource extends EventTarget implements IAudioControls {
	private _audio: HTMLAudioElement;
	private _sourceNode: MediaElementAudioSourceNode;
	private _audioOutput: AudioOutput;

	/**
	 * If we want to preserve this source on end (for re-use).
	 * Else, {@link _destroyed} gets used.
	 *
	 * **Note**: {@link AudioSource.loop `loop`} is ignored if this is `false`.
	 */
	private _preserve: boolean;

	private _canPlayCurrentSource: CanPlayTypeResult = "";

	private _destroyed: boolean = false;

	/**
	 * Audio source. This is the "better" version because we can detect if it's "undefined",
	 * while the native {@link HTMLMediaElement} {@link HTMLMediaElement.src `src`} doesn't.
	 */
	private _betterSrc: string;
	public get betterSrc(): string {
		return this._betterSrc;
	}

	public get loop(): boolean {
		return this._audio.loop;
	}

	public set loop(loop: boolean) {
		if (loop && !this._preserve) {
			throw new ReferenceError("Can't loop audio if 'preserve' is not enabled");
		}

		this._audio.loop = loop;
	}

	public get volume(): float {
		return this._audio.volume;
	}

	public set volume(volume: float) {
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
		audioSettings?: AudioSourceSettings,
		preserveOnEnd?: boolean
	) {
		super();

		this._audio = new Audio();

		// TODO: used to be "metadata" but now it's "none" since
		// this only seems to be useful during **the page** load.
		// can probably be removed or stay like this, not sure
		this._audio.preload = "none";

		// We don't want the audio to start playing automatically.
		// This is because we need to preload the metadata first,
		// so we're autoplaying it manually.
		this._audio.autoplay = false;

		this._preserve = preserveOnEnd;

		this.loop = audioSettings?.loop ?? false;

		// Prevent audio logic from breaking because of external playback controls
		this._audio.disableRemotePlayback = true;

		this._audioOutput = audioOutput;

		this.volume = audioSettings?.volume ?? 1;

		this.createSourceNode();
		this.initAudioEventListeners();

		this.changeTrack(audioSettings?.src, audioSettings?.audioTimings);
	}

	// TODO: update audio timings (and future settings) passing logic
	public changeTrack(src?: string, audioTimings?: AudioTimings): void {
		if (this._destroyed) {
			return;
		}

		this.pause();

		this._canPlayCurrentSource = "maybe";

		this._betterSrc = src ?? undefined;

		if (!this._betterSrc) {
			return;
		}

		this._audio.src = src;
		this._audio.load();

		if (audioTimings) {
			this.setAudioTimings(audioTimings);
		}
	}

	// TODO: effects/filters
	// public applyFilters(filters???): this { }

	private setAudioTimings(audioTimings: AudioTimings): void {
		this._audioTimings = audioTimings;

		Logger.logDebug("Audio timings set", audioTimings);

		this.seekTo(audioTimings.start);
	}

	public async play(): Promise<void> {
		if (this._destroyed) {
			Logger.logError("Can't resume: audio is destroyed");
			return;
		}

		if (!this._betterSrc) {
			Logger.logDebug("Audio has no src, play has been prevented");

			return;
		}

		if (!this._canPlayCurrentSource) {
			Logger.logDebug(
				"Audio source is unavailable, unsupported or has been prevented due to an error"
			);

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

	public seekTo(time: number): boolean {
		if (this._destroyed) {
			Logger.logError("Can't seekTo: audio is destroyed");

			return false;
		}

		if (!this._betterSrc) {
			Logger.logError("Audio has no src, seekTo has been prevented");

			return false;
		}

		// TODO:
		console.log("duration: ", this._audio.duration);
		console.log("currentTime: ", this._audio.currentTime);
		console.log("volume: ", this._audio.volume);

		const duration = this._audio.duration * 1000;

		if (duration < time) {
			Logger.logError(
				"Can't seek to a time greater than the audio duration",
				"\nAudio duration:",
				new Date(duration).toISOString().slice(11, -1),
				"\n     Seek time:",
				new Date(time).toISOString().slice(11, -1)
			);

			return false;
		}

		Logger.logDebug("Seeking to", new Date(time).toISOString().slice(11, -1));

		this._audio.currentTime = time / 1000;

		return true;
	}

	public async restart(): Promise<void> {
		let seeked = this.seekTo(this._audioTimings?.start ?? 0);

		if (seeked) {
			await this.play();
		}
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

	private createSourceNode(): void {
		// Generate source node
		this._sourceNode = this._audioOutput.createMediaElementSource(this._audio);

		// Connect source node to audio context
		this._audioOutput.connectNode(this._sourceNode);
	}

	//#region Audio events

	private initAudioEventListeners(): void {
		$(this._audio).on("error", (e) => {
			Logger.logError(
				"Audio source error",
				"\nOriginal event:\n",
				e.originalEvent,
				"\njQuery event:\n",
				e
			);

			if (!this._preserve) {
				Logger.logDebug("Destroying audio source");

				this.destroy();
			} else {
				this._canPlayCurrentSource = "";
			}

			this.triggerEvent("error");
		});

		$(this._audio).on("ended", () => {
			Logger.logDebug("Audio source ended. Time:", this._audio.currentTime);

			if (!this._preserve) {
				this.destroy();
			}

			this.triggerEvent("ended");
		});

		$(this._audio).on("pause", () => {
			// Don't trigger pause event if the audio has ended
			if (this.ended) {
				return;
			}

			this.triggerEvent("pause");
		});

		$(this._audio).on("canplay", () => {
			Logger.logDebug("Audio source can play");

			this.triggerEvent("canplay");
		});

		$(this._audio).on("suspend", () => {
			Logger.logDebug("Audio source suspended");

			this.triggerEvent("suspend");
		});

		$(this._audio).on("loadedmetadata", () => {
			Logger.logDebug("Audio source loaded metadata");

			this.restart();

			this.triggerEvent("loadedmetadata");
		});
	}

	private destroyAudioEventListeners(): void {
		$(this._audio).off("error ended pause canplay suspend loadedmetadata");
	}

	private triggerEvent(eventName: string): void {
		this.dispatchEvent(new Event(eventName));
	}

	//#endregion

	/**
	 * Dispose logic.
	 */
	private destroy(): void {
		this._destroyed = true;

		this.destroyAudioEventListeners();

		this._sourceNode.disconnect();
		this._sourceNode = null;

		this._audio.srcObject = null;
		this._audio = null;

		this._audioOutput = null;
	}
}
