class AudioStoreManager extends Logger {
	private singlePool: AudioGroup;
	private multiPool: AudioPool = new AudioPool();

	private multiPoolLimit: number = 10;

	constructor(volume: number = 0) {
		super();

		// Create main audio pool
		let main = new Audio() as AudioJS;
		let playback = new Audio() as AudioJS;
		this.singlePool = {
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
		this.singlePool.main.volume = this.singlePool.playback.volume = volume;

		// Add audio events
		this.singlePool.$all
			.on("canplay", (e) => {
				AudioStoreManager.logInfo("[constructor]", "Audio can play");
				this.playGroup(this.singlePool);
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

	public updateAudioDevice(device: MediaDeviceInfo): void {
		// TODO: add more logic and various guards (e.g. `main` and `playback` on same output)
		this.singlePool.main.setSinkId(device.deviceId);
	}

	public addToSinglePool(path: string, time: AudioTimings): void {
		this.stopMultiPoolAudio();

		// If the path is different from the previous one
		if (this.singlePool.lastTrack !== path) {
			AudioStoreManager.logInfo(
				this.addToSinglePool,
				"New path different from previous one.\n%s",
				`• Last track path: "%c%s%c"\n%s`,
				"color: #03fc98;",
				this.singlePool.lastTrack,
				"",
				`• New track path: "%c%s%c"`,
				"color: #03fc98;",
				path,
				""
			);

			this.singlePool.lastTrack = path;
			this.singlePool.main.src = this.singlePool.playback.src = path;
			AudioStoreManager.logInfo(
				this.addToSinglePool,
				`Setting new path: "%c%s%c"`,
				"color: #03fc98;",
				path,
				""
			);

			this.singlePool.main.load();
			this.singlePool.playback.load();
		}

		const timeInSeconds = time.start === 0 ? time.start : time.start / 1000;

		this.singlePool.main.currentTime = this.singlePool.playback.currentTime =
			timeInSeconds;
		// TODO: notify if the start time is longer than the actual duration of the track
	}

	public addToMultiPool(audioGroup: AudioPoolGroup): void {
		AudioStoreManager.logInfo(
			this.addToMultiPool,
			"Adding new group to multi pool:",
			audioGroup
		);

		this.multiPool.add(audioGroup);

		this.playGroup(audioGroup);
	}

	public async play(): Promise<void> {
		if (
			this.singlePool.lastTrack != "" /* &&
			this.singlePool.main.currentTime != this.singlePool.main.duration*/ // This is a nice feature
		) {
			await this.singlePool.main.play();
			await this.singlePool.playback.play();
		}

		if (this.multiPool.hasAudio) await this.multiPool.play();
	}

	public pause(): void {
		this.singlePool.main.pause();
		this.singlePool.playback.pause();

		if (this.multiPool.hasAudio) this.multiPool.pause();
	}

	public stop(): void {
		this.singlePool.main.pause();
		this.singlePool.playback.pause();

		this.stopSinglePoolAudio();
		this.stopMultiPoolAudio();
	}

	public get isPlaying(): boolean {
		return (
			this.singlePool.main.paused === false ||
			(this.multiPool.hasAudio && this.multiPool.isPlaying)
		);
	}

	public get isLimitReached(): boolean {
		return this.multiPool.length > this.multiPoolLimit;
	}

	private playGroup(group: AudioGroup | AudioPoolGroup): void {
		// try {
		group.main.play();
		group.playback.play();
		// } catch (e) {
		// 	AudioStoreManager.error(this.playGroup, e); // TODO
		// }
	}

	public setVolume(value: number): void {
		this.singlePool.main.volume = this.singlePool.playback.volume = value;

		if (this.multiPool.hasAudio) this.multiPool.volume = value;
	}

	private stopSinglePoolAudio(): void {
		try {
			this.singlePool.$all.stop();
		} catch (e) {
			AudioStoreManager.logError(this.stopSinglePoolAudio, "", e);
			return;
		}

		this.singlePool.lastTrack = "";
	}

	private stopMultiPoolAudio(): void {
		if (!this.multiPool.hasAudio) {
			return;
		}

		this.multiPool.stop();
	}
}
