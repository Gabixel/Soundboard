/**
 * The actual audio, containing a {@link HTMLAudioElement} connected to an {@link AudioContext}.
 */
class AudioSource extends EventTarget implements IAudioControls {
	/**
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio
	 */
	private _audio: HTMLAudioElement;
	private _sourceNode: MediaElementAudioSourceNode;
	private _audioOutput: AudioOutput;

	private _logsPrefix: string = "";

	private _timeUpdateSemaphore = new Semaphore();

	/**
	 * If we want to preserve this source on end (for re-use).
	 * Else, {@link _destroyed} gets used.
	 *
	 * **Note**: {@link AudioSource.loop `loop`} is ignored if this is `false`.
	 */
	private _preserve: boolean;

	private _canPlayCurrentSource: CanPlayTypeResult = "";

	private _destroyed: boolean;

	/**
	 * Audio source. This is the "better" version because we can detect if it's `undefined`,
	 * while the native {@link HTMLMediaElement} {@link HTMLMediaElement.src `src`} doesn't.
	 */
	private _betterSrc: string;
	public get betterSrc(): string {
		return this._betterSrc;
	}

	private _loop: boolean;
	public get loop(): boolean {
		return this._loop;
	}
	public set loop(loop: boolean) {
		if (loop && !this._preserve) {
			throw new ReferenceError("Can't loop audio if 'preserve' is not enabled");
		}

		this._loop = loop;
	}

	public get volume(): float {
		return this._audio.volume;
	}

	public set volume(volume: float) {
		this._audio.volume = volume;
	}

	public get duration(): float {
		return this._audio.duration;
	}

	public get currentTime(): float {
		return this._audio.currentTime;
	}

	/**
	 * Audio timings settings.
	 */
	private _audioTimings: AudioTimings;
	public get audioTimings(): AudioTimings {
		return this._audioTimings;
	}
	public set audioTimings(audioTimings: AudioTimings) {
		this._audioTimings = audioTimings;

		this.logDebug("Audio timings set to", audioTimings);
	}

	constructor(
		audioOutput: AudioOutput,
		audioSettings?: AudioSourceSettings,
		preserveOnEnd?: boolean,
		logsPrefix: string = ""
	) {
		super();

		this._logsPrefix = logsPrefix;

		this._audio = new Audio();

		// TODO: Used to be "metadata" but now it's "none" since
		// this only seems to be useful during the page **load**.
		// Can probably be removed, but still not sure.
		this._audio.preload = "none";

		// We don't want the audio to start playing automatically.
		// This is because we need to preload the metadata first,
		// so we're autoplaying it manually after that.
		this._audio.autoplay = false;

		this._preserve = preserveOnEnd;

		this.loop = audioSettings?.loop ?? false;

		// Prevent external playback controls
		this._audio.disableRemotePlayback = true;

		this._audioOutput = audioOutput;

		this.volume = audioSettings?.volume ?? 1;

		this.audioTimings = audioSettings?.audioTimings;

		this.createSourceNode();
		this.initAudioEventListeners();

		this.changeTrack(audioSettings?.src);
	}

	public changeTrack(src?: string): void {
		if (this._destroyed) {
			this.logError("Can't changeTrack: audio is destroyed");
			return;
		}

		this.pause();

		this._canPlayCurrentSource = "maybe";

		this._betterSrc = src ?? undefined;

		if (!this._betterSrc) {
			this.logDebug("Invalid/Empty audio source");
			return;
		}

		let parts = this._betterSrc.split("\\");
		let filename = parts[parts.length - 1];

		this.logDebug(`Changing audio source to "${decodeURIComponent(filename)}"`);
		
		this._audio.src = src;
		this._audio.load();
	}

	// TODO: effects/filters
	// public applyFilters(filters???): this { }

	public async play(): Promise<void> {
		if (this._destroyed) {
			this.logError("Can't play/resume: audio is destroyed");
			return;
		}

		if (!this._betterSrc) {
			this.logDebug("Can't play/resume: audio has no src");
			return;
		}

		if (!this._canPlayCurrentSource) {
			this.logDebug(
				"Can't play/resume: audio source is unavailable, unsupported or has been prevented due to an error"
			);
			return;
		}

		if (this.ended) {
			await this.restart();
		} else {
			await this._audio.play();
		}
	}

	public pause(): void {
		if (this._destroyed) {
			this.logError("Can't pause: audio is destroyed");
			return;
		}

		this._audio.pause();
	}

	public seekTo(time: number, isMilliseconds: boolean = true): boolean {
		if (this._destroyed) {
			this.logError("Can't seekTo: audio is destroyed");
			return false;
		}

		if (!this._betterSrc) {
			this.logWarn("Can't seekTo: audio has no src");
			return false;
		}

		if (!this._canPlayCurrentSource) {
			this.logError(
				"Can't seekTo: audio source is unavailable, unsupported or has been prevented due to an error"
			);
			return false;
		}

		const duration = this.duration * 1000; // 1.500s -> 1500ms

		if (isNaN(duration)) {
			this.logDebug("Can't seek until the audio has loaded metadata");
			return false;
		}

		if (!isMilliseconds) {
			time *= 1000; // 1.500s -> 1500ms
			isMilliseconds = true;
		}

		if (duration < time) {
			this.logError(
				"Can't seek to a time greater than the audio duration",
				"\n     Seek time:",
				new Date(time).toISOString().slice(11, -1),
				"\nAudio duration:",
				new Date(duration).toISOString().slice(11, -1)
			);

			return false;
		}

		this.logDebug(
			`Seeking to ${new Date(time).toISOString().slice(11, -1)} (${time}ms)`
		);

		this._audio.currentTime = isMilliseconds ? time * 0.001 : time;

		return true;
	}

	public async restart(autoplay = true): Promise<void> {
		if (this._destroyed) {
			this.logError("Can't restart: audio is destroyed");
			return;
		}

		if (!this._betterSrc) {
			this.logDebug("Can't restart: audio has no src");
			return;
		}

		if (!this._canPlayCurrentSource) {
			this.logError(
				"Can't restart: audio source is unavailable, unsupported or has been prevented due to an error"
			);
			return;
		}

		let seeked = this.trySeekingToTimingsStart();

		if (seeked && autoplay) {
			await this.play();
		}
	}

	public async end(): Promise<void> {
		if (this._destroyed) {
			this.logError("Can't end: audio is destroyed");
			return;
		}

		if (!this._betterSrc) {
			this.logDebug("Can't end: audio has no src");
			return;
		}

		if (!this._canPlayCurrentSource) {
			this.logError(
				"Can't end: audio source is unavailable, unsupported or has been prevented due to an error"
			);
			return;
		}

		let needsToEnd =
			!this._destroyed &&
			!this.ended &&
			!isNaN(this.duration) &&
			this.currentTime < this.duration;

		if (!needsToEnd) {
			return;
		}

		// We seek at the end, so that the provided `ended` variable quickly becomes `true`.
		// We'll reset it to the desired timing later thanks to this.
		this.seekTo(this._audio.duration, false);
		this.paused && (await this.play());

		// Seeking at the end while the audio is paused doesn't trigger the `ended` event by itself.
		// We also need to specify that it was forced.
		$(this._audio).trigger("ended", {
			forced: true,
		});
	}

	public get playing(): boolean {
		return !this._destroyed && !this._audio.paused && !this._audio.ended;
	}

	public get paused(): boolean {
		return !this._destroyed && this._audio.paused;
	}

	public get ended(): boolean {
		return this._destroyed || this._audio.ended;
	}

	/**
	 * Tries seeking to the specific point in time provided by the {@link audioTimings} if declared (and valid).
	 * Else, it seeks to the start of the audio.
	 *
	 * @returns `true` if the audio seeked successfully. `false` otherwise.
	 */
	private trySeekingToTimingsStart(): boolean {
		return this.seekTo(this._audioTimings?.start ?? 0);
	}

	private createSourceNode(): void {
		// Generate source node
		this._sourceNode = this._audioOutput.createMediaElementSource(this._audio);

		// Connect source node to audio context
		this._audioOutput.connectNode(this._sourceNode);
	}

	private async onTimeUpdate(
		_e: JQuery.TriggeredEvent<
			HTMLAudioElement,
			undefined,
			HTMLAudioElement,
			HTMLAudioElement
		>
	): Promise<boolean> {
		if (this._destroyed) {
			return false;
		}

		if (!this._audioTimings) {
			return false;
		}

		if (!this._audio) {
			return false;
		}

		const currentTime = this._audio.currentTime * 1000;

		const start = this._audioTimings.start;
		const end = this._audioTimings.end;
		const condition = this._audioTimings.condition;

		switch (condition) {
			case "at":
				// Ending condition is invalid
				if (end <= start) {
					return true;
				}

				if (currentTime < end) {
					return true;
				}

				break;

			case "after":
				// Audio started before starting point
				if (currentTime < start) {
					return true;
				}

				const remainingTime = currentTime - start;

				// We didn't reach the end yet
				if (remainingTime < end) {
					return true;
				}

			default:
				return false;
		}

		await this.end();
		return false;
	}

	//#region Audio events

	private getAudioErrorName(errorCode: number): string {
		const keys = Object.keys(Object.getPrototypeOf(this._audio.error)).filter(
			(key) => key.startsWith("MEDIA_ERR")
		);

		return keys.find((key) => this._audio.error[key] === errorCode) ?? "unknown";
	}

	/**
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio#events
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement#events
	 */
	private initAudioEventListeners(): void {
		$(this._audio).on("error", (e) => {
			const errorCode = this._audio.error ? this._audio.error.code : 0;

			const errorName = this.getAudioErrorName(errorCode);

			// TODO: handle per-error issues. See the commented code for an example.
			// // If there's a network-level error,
			// // we try to prevent errors in the audio playability.
			// if (errorCode === this._audio.error.MEDIA_ERR_NETWORK) {
			//  // ...
			// 	return;
			// }

			this.logError(
				"Audio error",
				`\n'${this._audio.error.message}'`,
				"\nError code:",
				errorCode,
				`(${errorName})`,
				"\nOriginal event:",
				e.originalEvent,
				"\njQuery event:",
				e,
				"\nAudio error object:",
				this._audio.error
			);

			if (!this._preserve) {
				this.destroy();
			} else {
				this._canPlayCurrentSource = "";
			}

			this.triggerEvent("error");
		});

		// Playback has stopped because the end of the media was reached
		$(this._audio).on("ended", async (_e, args = { forced: false }) => {
			this.logDebug("Audio ended. Time:", this._audio.currentTime);

			if (!this._preserve) {
				this.destroy();
			}

			if (this.loop && !args.forced) {
				this.logDebug("Restarting...");
				await this.restart();
				// Don't treat it as ended since we're restarting
				return;
			}

			this.triggerEvent("ended");
		});

		// Playback has been paused
		$(this._audio).on("pause", () => {
			// Don't trigger pause event if the audio has ended
			if (this.ended) {
				return;
			}

			this.logDebug("Audio paused");

			this.triggerEvent("pause");
		});

		// The browser can play the media, but estimates that not enough data has been loaded
		// to play the media up to its end without having to stop for further buffering of content
		$(this._audio).on("canplay", () => {
			this.logDebug("Audio can play");

			this.triggerEvent("canplay");
		});

		// TODO: check if this is needed
		// Media data loading has been suspended
		$(this._audio).on("suspend", () => {
			this.logDebug("Audio suspended");

			this.triggerEvent("suspend");
		});

		// The time indicated by the `currentTime` attribute has been updated
		$(this._audio).on("timeupdate", async (e) => {
			if (this.ended || this.paused) {
				return;
			}

			if (!this._timeUpdateSemaphore.isLocked) {
				this._timeUpdateSemaphore.lock();
				let shouldPropagate = await this.onTimeUpdate(e);
				this._timeUpdateSemaphore.unlock();

				if (!shouldPropagate) {
					return;
				}
			}

			this.triggerEvent("timeupdate");
		});

		// The first frame of the media has finished loading
		$(this._audio).on("loadeddata", () => {
			this.logDebug("Audio loaded first frame data");

			this.triggerEvent("loadeddata");
		});

		// The metadata has been loaded
		$(this._audio).on("loadedmetadata", async () => {
			this.logDebug("Audio loaded metadata");

			// Start the audio right when metadata loaded.
			// Buffering is expected in some scenarios.
			await this.restart();

			this.triggerEvent("loadedmetadata");
		});

		// Fired when the browser has started to load the resource
		$(this._audio).on("loadstart", () => {
			this.logDebug("Audio started loading data");
		});

		// The user agent is trying to fetch media data, but data is unexpectedly not forthcoming
		$(this._audio).on("stalled", () => {
			this.logWarn("Audio stalled (but still trying to play)");
		});

		// The media has become empty; for example,
		// this event is sent if the media has already been loaded (or partially loaded),
		// and the `HTMLMediaElement.load` method is called to reload it
		$(this._audio).on("emptied", () => {
			this.logDebug("Audio emptied");
		});

		// The rendering of an `OfflineAudioContext` is terminated
		$(this._audio).on("complete", () => {
			this.logDebug("Audio rendering completed");
		});

		// The `duration` attribute has been updated
		$(this._audio).on("durationchange", () => {
			this.logWarn("Audio duration changed");
		});

		// A seek operation completed
		$(this._audio).on("seeked", () => {
			this.logDebug("Audio successfully seeked");
		});

		// A seek operation began
		$(this._audio).on("seeking", () => {
			this.logDebug("Audio is seeking");
		});

		// Playback has stopped because of a temporary lack of data
		$(this._audio).on("waiting", () => {
			this.logWarn("Audio is waiting for more data");
		});

		// The resource was not fully loaded, but not as the result of an error
		$(this._audio).on("abort", () => {
			this.logWarn("Audio aborted");
		});

		// Fired periodically as the browser loads a resource
		$(this._audio).on("progress", () => {
			this.logDebug("Audio load progressed");
		});
	}

	private destroyAudioEventListeners(): void {
		$(this._audio).off(
			[
				"error",
				"ended",
				"pause",
				"canplay",
				"suspend",
				"timeupdate",
				"loadeddata",
				"loadedmetadata",
			].join(" ")
		);
	}

	private triggerEvent(eventName: string): void {
		this.dispatchEvent(new Event(eventName));
	}

	//#endregion Audio events

	/**
	 * Dispose logic.
	 */
	private destroy(): void {
		if (this._destroyed) {
			return;
		}

		this.logDebug("Disposing audio source");

		this._destroyed = true;

		this.destroyAudioEventListeners();

		this._sourceNode.disconnect();
		this._sourceNode = null;

		this._audio.srcObject = null;
		this._audio = null;

		this._audioOutput = null;

		this._canPlayCurrentSource = "";
	}

	private logDebug(message: string, ...optionalParams: any[]): void {
		Logger.logDebug(`${this._logsPrefix} ${message}`, ...optionalParams);
	}

	private logWarn(message: string, ...optionalParams: any[]): void {
		Logger.logWarn(`${this._logsPrefix} ${message}`, ...optionalParams);
	}

	private logError(message: string, ...optionalParams: any[]): void {
		Logger.logError(`${this._logsPrefix} ${message}`, ...optionalParams);
	}
}
