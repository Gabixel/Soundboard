class AudioStoreManager extends Logger {
	private _singlePool: AudioGroup;
	private _multiPool: AudioPool = new AudioPool();

	private _multiPoolLimit: number = 10;

	// private _currentDeviceId: string;
	// public get currentDeviceId(): string {
	// 	return this._currentDeviceId;
	// }

	constructor(singlePoolVolume: number = 0) {
		super();

		// Create main audio pool
		let main = new Audio();
		let playback = new Audio();
		this._singlePool = {
			main,
			playback,
			$all: $(main).add($(playback)),
			all: (func) => {
				func(main);
				func(playback);
			},
			lastTrack: "",
		};

		// TODO: caching (somehow)?
		// Set anonymous crossorigin for caching
		// See: https://developer.chrome.com/docs/workbox/serving-cached-audio-and-video/#:~:text=elements%20need%20to%20opt%20into%20CORS%20mode%20with%20the%20crossorigin%20attribute
		// main.crossOrigin = playback.crossOrigin = "anonymous";

		// Set to desired volume
		// TODO: sum with overriding volume when it will be implemented
		this._singlePool.main.volume = this._singlePool.playback.volume =
			singlePoolVolume;

		// Use "default" device id for playback
		this._singlePool.playback.setSinkId("default");

		// Add audio events
		this._singlePool.$all
			.on("canplay", () => {
				AudioStoreManager.logInfo("[constructor]", "Audio can play");
				this.playGroup(this._singlePool);
			})
			.on("error", (e) => {
				AudioStoreManager.logError(
					"(singlePool.main 'onerror' event)",
					"Error loading audio\n",
					`(Code ${e.target.error.code}) "${e.target.error.message}"\n`,
					e
				);
			});
	}

	public async setAudioDevice(device: MediaDeviceInfo): Promise<void> {
		await this._singlePool.main
			.setSinkId(device.deviceId)
			// .then(() => {
			// 	// Store new device id
			// 	// this._currentDeviceId = device.deviceId;

			// 	// TODO: handle in case of same deviceId/groupId/label for both main and playback
			// })
			.catch((e) => {
				AudioStoreManager.logError(
					this.setAudioDevice,
					`Error while setting audio device '${device?.label}'`,
					"\n",
					e
				);
			});
	}

	public addToSinglePool(path: string, time: AudioTimings): void {
		// The intended use is to interrupt all audio in the multi pool when starting the single group
		this.stopMultiPoolAudio();

		// If the path is different from the previous one
		if (this._singlePool.lastTrack !== path) {
			AudioStoreManager.logInfo(
				this.addToSinglePool,
				"New path different from previous one.\n%s",
				`• Last track path: "%c%s%c"\n%s`,
				"color: #03fc98;",
				this._singlePool.lastTrack,
				"",
				`• New track path: "%c%s%c"`,
				"color: #03fc98;",
				path,
				""
			);

			this._singlePool.lastTrack = path;
			this._singlePool.main.src = this._singlePool.playback.src = path;
			AudioStoreManager.logInfo(
				this.addToSinglePool,
				`Setting new path: "%c%s%c"`,
				"color: #03fc98;",
				path,
				""
			);

			this._singlePool.main.load();
			this._singlePool.playback.load();
		}

		const timeInSeconds = time.start / 1000;

		this._singlePool.main.currentTime = this._singlePool.playback.currentTime =
			timeInSeconds;
		// TODO: notify if the start time is longer than the actual duration of the track
		// TODO: end time
	}

	public addToMultiPool(audioGroup: AudioPoolGroup): void {
		AudioStoreManager.logInfo(
			this.addToMultiPool,
			"Adding new group to multi pool:",
			audioGroup
		);

		this._multiPool.add(audioGroup);

		this.playGroup(audioGroup);
	}

	public async play(): Promise<void> {
		if (
			this._singlePool.lastTrack != "" /* &&
			this.singlePool.main.currentTime != this.singlePool.main.duration*/ // This is a nice feature
		) {
			await this._singlePool.main.play();
			await this._singlePool.playback.play();
		}

		if (this._multiPool.hasAudio) {
			await this._multiPool.play();
		}
	}

	public pause(): void {
		this._singlePool.main.pause();
		this._singlePool.playback.pause();

		if (this._multiPool.hasAudio) this._multiPool.pause();
	}

	public stop(): void {
		this._singlePool.main.pause();
		this._singlePool.playback.pause();

		this.stopSinglePoolAudio();
		this.stopMultiPoolAudio();
	}

	public get isPlaying(): boolean {
		return (
			this._singlePool.main.paused === false ||
			(this._multiPool.hasAudio && this._multiPool.isPlaying)
		);
	}

	public get isLimitReached(): boolean {
		return this._multiPool.length > this._multiPoolLimit;
	}

	private playGroup(group: AudioGroup | AudioPoolGroup): void {
		group.main.play();
		group.playback.play();
	}

	public setSinglePoolVolume(value: number): void {
		this._singlePool.main.volume = this._singlePool.playback.volume = value;
	}

	public setMultiPoolVolume(value: number): void {
		if (this._multiPool.hasAudio) this._multiPool.volume = value;
	}

	private stopSinglePoolAudio(): void {
		try {
			this._singlePool.$all.stop();
		} catch (e) {
			AudioStoreManager.logError(this.stopSinglePoolAudio, "", e);
			return;
		}

		this._singlePool.lastTrack = "";
	}

	private stopMultiPoolAudio(): void {
		if (!this._multiPool.hasAudio) {
			return;
		}

		this._multiPool.stop();
	}
}
