class AudioStoreManager {
	private singlePool: AudioGroup = {
		main: new Audio() as AudioJS,
		playback: new Audio() as AudioJS,
		lastTrack: "",
	};
	private multiPool: AudioPool = new AudioPool();

	constructor(volume: number = 0) {
		this.singlePool.main.volume = this.singlePool.playback.volume = volume;
		$(this.singlePool.main)
			.add(this.singlePool.playback)
			.on("canplay", (e) => {
				Logger.logInfo("AudioStoreManager", "[constructor]", "Audio can play");
				this.playGroup(this.singlePool);
			})
			.on("error", (e) => {
				Logger.logError(
					"AudioStoreManager",
					"[constructor]",
					"Error loading audio\n",
					`(Code ${e.target.error.code}) "${e.target.error.message}"\n`,
					e
				);
			});
	}

	public updateAudioDevice(device: MediaDeviceInfo): void {
		this.singlePool.main.setSinkId(device.deviceId);
	}

	public addToSinglePool(path: string, time: AudioTimings): void {
		this.stopMultiPoolAudio();

		// If the path is different from the previous one
		if (this.singlePool.lastTrack !== path) {
			Logger.logInfo(
				"AudioStoreManager",
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
			Logger.logInfo(
				"AudioStoreManager",
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
		// Limited sounds to prevent memory or human ear issues
		if (this.multiPool.length > 50) {
			Logger.logInfo(
				"AudioStoreManager",
				this.addToMultiPool,
				"Pool limit exceeded."
			);
			return;
		}

		Logger.logInfo(
			"AudioStoreManager",
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

		this.stopMultiPoolAudio();

		$(this.singlePool.main).add($(this.singlePool.playback)).removeAttr("src");
		this.singlePool.lastTrack = "";

		this.singlePool.main.load();
		this.singlePool.playback.load();
	}

	public get isPlaying(): boolean {
		return (
			this.singlePool.main.paused === false ||
			(this.multiPool.hasAudio && this.multiPool.isPlaying)
		);
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

	private stopMultiPoolAudio(): void {
		if (this.multiPool.hasAudio) this.multiPool.stop();
	}
}
