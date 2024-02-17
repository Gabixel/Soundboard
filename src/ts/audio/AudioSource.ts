/**
 * The actual audio, which contains an {@link HTMLAudioElement} linked to
 * an {@link AudioContext}, along with {@link AudioTimings} (and more to come).
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
	 * Else, {@link _destroyed} is used.
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

		// We don't want the audio to suddenly start playing.
		// This is because we need to preload the metadata first,
		// so we're playing it manually after that.
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

	/**
	 * There's no real way to "stop" an audio in JavaScript.
	 * Best/Easiest way to simulate it is to clear the `src` attribute,
	 * but we have to do it the hard way, using `removeAttribute`,
	 * or we will get a {@link MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED `MEDIA_ERR_SRC_NOT_SUPPORTED`} error back.
	 *
	 * @see https://stackoverflow.com/a/39529112/16804863
	 */
	private clearAudioSrc(): void {
		this._betterSrc = undefined;
		this._audio.removeAttribute("src");
		this._audio.load();
	}

	/**
	 * @inheritDoc
	 */
	public seekTo(seekTime: number, isMilliseconds: boolean = true): boolean {
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
			seekTime *= 1000; // 1.500s -> 1500ms
			isMilliseconds = true;
		}

		if (duration < seekTime) {
			this.logError(
				"Can't seek to a time greater than the audio duration",
				"\n     Seek time:",
				new Date(seekTime).toISOString().slice(11, -1),
				"\nAudio duration:",
				new Date(duration).toISOString().slice(11, -1)
			);

			return false;
		}

		this.logDebug(
			`Seeking to ${new Date(seekTime)
				.toISOString()
				.slice(11, -1)} (${seekTime}ms)`
		);

		this._audio.currentTime = isMilliseconds ? seekTime * 0.001 : seekTime;

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
			this.logWarn(
				"Can't end: audio source is unavailable, unsupported or has been prevented due to an error"
			);
			return;
		}

		let needsToForceEnd =
			!this.ended && // ended also checks if the src is undefined
			!isNaN(this.duration) &&
			this.currentTime < this.duration;

		if (!needsToForceEnd) {
			return;
		}

		this.clearAudioSrc();

		// Clearing the src won't fire the ended event by itself,
		// so we need to trigger it manually.
		// This also allows us to include a flag to indicate that
		// the end was forced, to prevent some logic (like looping) from firing.
		$(this._audio).trigger("ended", {
			forced: true,
		});
	}

	public get playing(): boolean {
		return !this._audio.paused && !this._audio.ended && !this._destroyed;
	}

	public get paused(): boolean {
		return this._audio.paused && !this._destroyed;
	}

	public get ended(): boolean {
		return this._audio.ended || this._betterSrc === undefined || this._destroyed;
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

	private async onTimeUpdate(_e: JQuery.TriggeredEvent): Promise<boolean> {
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

			eventError(
				e,
				"Audio error",
				`\nError: '${this._audio.error.message}'`,
				`\nError code: ${errorCode} (${errorName})`,
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
		$(this._audio).on("ended", async (e, args = { forced: false }) => {
			eventDebug(e, "Audio ended");

			// TODO: revisit destroy logic
			if (!this._preserve) {
				this.destroy();
			}

			if (this.loop && !args.forced) {
				eventDebug(e, "Restarting loop...");
				await this.restart();
				// Don't treat it as ended since we're restarting
				return;
			}

			this.triggerEvent("ended");
		});

		// Playback has been paused
		$(this._audio).on("pause", (e) => {
			// Don't trigger pause event if the audio has ended
			if (this.ended) {
				return;
			}

			eventDebug(e, "Audio paused");

			this.triggerEvent("pause");
		});

		// The browser can play the media, but estimates that not enough data has been loaded
		// to play the media up to its end without having to stop for further buffering of content
		$(this._audio).on("canplay", (e) => {
			eventDebug(e, "Audio can play (non-buffering not guaranteed)");

			this.triggerEvent("canplay");
		});

		// The browser estimates it can play the media up to its end
		// without stopping for content buffering
		$(this._audio).on("canplaythrough", (e) => {
			eventDebug(e, "Audio can play through the end (estimated by the browser)");
		});

		// TODO: check if this is needed
		// Media data loading has been suspended
		$(this._audio).on("suspend", (e) => {
			eventDebug(e, "Audio suspended");

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
		$(this._audio).on("loadeddata", (e) => {
			eventDebug(e, "Audio loaded first frame data");

			this.triggerEvent("loadeddata");
		});

		// The metadata has been loaded
		$(this._audio).on("loadedmetadata", async (e) => {
			eventDebug(e, "Audio loaded metadata");

			// Start the audio right when metadata loaded.
			// Buffering is expected in some scenarios.
			await this.restart();

			this.triggerEvent("loadedmetadata");
		});

		// Fired when the browser has started to load the resource
		$(this._audio).on("loadstart", (e) => {
			eventDebug(e, "Audio started loading data");
		});

		// The user agent is trying to fetch media data, but data is unexpectedly not forthcoming
		$(this._audio).on("stalled", (e) => {
			eventWarn(e, "Audio stalled (but still trying to play)");
		});

		// The media has become empty; for example,
		// this event is sent if the media has already been loaded (or partially loaded),
		// and the `HTMLMediaElement.load` method is called to reload it
		$(this._audio).on("emptied", (e) => {
			eventDebug(e, "Audio emptied");
		});

		// The rendering of an `OfflineAudioContext` is terminated
		$(this._audio).on("complete", (e) => {
			eventDebug(e, "Audio rendering completed");
		});

		// The `duration` attribute has been updated
		$(this._audio).on("durationchange", (e) => {
			eventWarn(e, "Audio duration changed");
		});

		// A seek operation completed
		$(this._audio).on("seeked", (e) => {
			eventDebug(e, "Audio seeked successfully");
		});

		// A seek operation began
		$(this._audio).on("seeking", (e) => {
			eventDebug(e, "Audio is seeking");
		});

		// Playback has stopped because of a temporary lack of data
		$(this._audio).on("waiting", (e) => {
			eventWarn(e, "Audio is waiting for more data");
		});

		// The resource was not fully loaded, but not as the result of an error
		$(this._audio).on("abort", (e) => {
			// An abort event is inevitable when the source is emptied and the audio was not finished
			if (!this._betterSrc) {
				return;
			}

			eventWarn(e, "Audio aborted");

			this.triggerEvent("abort");
		});

		// Fired periodically as the browser loads a resource
		$(this._audio).on("progress", (e) => {
			eventDebug(e, "Audio load progressed");
		});

		// Playback has begun
		$(this._audio).on("play", (e) => {
			eventDebug(e, "Audio play");
		});

		// Playback is ready to start after having been paused or delayed due to lack of data
		$(this._audio).on("playing", (e) => {
			eventDebug(e, "Audio playing");
		});

		// The playback rate has changed
		$(this._audio).on("ratechange", (e) => {
			eventDebug(e, "Audio playback rate changed");
		});

		const eventDebug = (
			e: JQuery.Event,
			message: string,
			...optionalParams: any[]
		) => {
			this.logDebug(`("${e.type}" event) ${message}`, ...optionalParams);
		};

		const eventWarn = (
			e: JQuery.Event,
			message: string,
			...optionalParams: any[]
		) => {
			this.logWarn(`["${e.type}" event] ${message}`, ...optionalParams);
		};

		const eventError = (
			e: JQuery.Event,
			message: string,
			...optionalParams: any[]
		) => {
			this.logError(`["${e.type}" event] ${message}`, ...optionalParams);
		};
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
				"abort",
				// Non-dispatched/unused ones:
				"canplaythrough",
				"loadstart",
				"stalled",
				"emptied",
				"complete",
				"durationchange",
				"seeked",
				"seeking",
				"waiting",
				"progress",
				"play",
				"playing",
				"ratechange",
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

		this.logDebug("Disposing audio source...");

		this._destroyed = true;

		this.destroyAudioEventListeners();

		if (this._betterSrc) {
			this.clearAudioSrc();
		}

		this._sourceNode.disconnect();
		this._sourceNode = null;

		this._audio.srcObject = null;
		this._audio = null;

		this._audioOutput = null;

		this._canPlayCurrentSource = "";
	}

	//#region Logger improvements

	private getLogData(
		message: string,
		...optionalParams: any[]
	): [string, ...any] {
		const additionalAudioData = "\nAudio data: " + this.getAdditionalAudioData();

		// We add the audio data before the last optional element if it's used for logger magic
		if (optionalParams.length > 0) {
			const lastParamIndex = optionalParams.length - 1;
			const lastParam = optionalParams[lastParamIndex];

			if (Logger.isObjectForManualCallers(lastParam)) {
				// This logic adds the audio data before the last object
				optionalParams.splice(lastParamIndex, 0, additionalAudioData);
			} else {
				optionalParams.push(additionalAudioData + "\n");
			}
		} else {
			optionalParams = [additionalAudioData];
		}

		return [
			`${this._logsPrefix ? this._logsPrefix + " " : ""}${message}`,
			...optionalParams,
		];
	}

	private getAdditionalAudioData(): string {
		return this._destroyed
			? "<audio destroyed>"
			: `Ready state: ${this._audio.readyState} (${this.getAudioReadyState(
					this._audio.readyState
			  )}) | Network state: ${
					this._audio.networkState
			  } (${this.getAudioNetworkState(
					this._audio.networkState
			  )}) | Current time: ${this._audio.currentTime}`;
	}

	private getAudioErrorName(errorCode: number): string {
		const proto = Object.getPrototypeOf(this._audio.error);

		const keys = Object.keys(proto).filter((key) => key.startsWith("MEDIA_ERR"));

		return keys.find((key) => proto[key] === errorCode) ?? "unknown";
	}

	/**
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState
	 */
	private getAudioReadyState(readyState: number): string {
		const proto = Object.getPrototypeOf(HTMLAudioElement);

		const keys = Object.keys(proto).filter((key) => key.startsWith("HAVE_"));

		return keys.find((key) => proto[key] === readyState) ?? "unknown";
	}

	/**
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/networkState
	 */
	private getAudioNetworkState(networkState: number): string {
		const proto = Object.getPrototypeOf(HTMLAudioElement);

		const keys = Object.keys(proto).filter((key) => key.startsWith("NETWORK_"));

		return keys.find((key) => proto[key] === networkState) ?? "unknown";
	}

	private logDebug(message: string, ...optionalParams: any[]): void {
		Logger.logDebug(...this.getLogData(message, ...optionalParams));
	}

	private logWarn(message: string, ...optionalParams: any[]): void {
		Logger.logWarn(...this.getLogData(message, ...optionalParams));
	}

	private logError(message: string, ...optionalParams: any[]): void {
		Logger.logError(...this.getLogData(message, ...optionalParams));
	}

	//#endregion Logger improvements
}
