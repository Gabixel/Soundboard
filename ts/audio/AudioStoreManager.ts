class AudioStoreManager extends LogExtend {
	private singlePool: AudioGroup = {
		main: new Audio() as AudioJS,
		playback: new Audio() as AudioJS,
		lastTrack: "",
	};
	private multiPool: AudioPool = new AudioPool();

	constructor(volume: number = 0) {
		super();
		this.singlePool.main.volume = this.singlePool.playback.volume = volume;
	}

	public updateAudioDevice(device: MediaDeviceInfo): void {
		this.singlePool.main.setSinkId(device.deviceId);
	}

	public addAudioOrPath(audio: string | AudioPoolGroup) {
		if (typeof audio === "string") {
			this.addToSinglePool(audio);
		} else {
			if (this.multiPool.length < 50)
				// Limited sounds to prevent memory issues
				this.addToMultiPool(audio);
		}
	}

	public addToSinglePool(path: string): void {
		this.stopMultiPoolAudio();

		if (this.singlePool.lastTrack !== path) {
			this.singlePool.lastTrack = path;
			this.singlePool.main.src = this.singlePool.playback.src = path;
			AudioStoreManager.log(
				this.addToSinglePool,
				`Setting new path: "%c%s%c"`,
				"font-style: italic",
				path,
				""
			);

			this.singlePool.main.load();
			this.singlePool.playback.load();
		} else {
			// set both track at 0 if the last track hasn't changed
			AudioStoreManager.log(
				this.addToSinglePool,
				"New path is the same as last one, setting time to 0.\n",
				`• Last track path: "${this.singlePool.lastTrack}"\n`,
				`• New track path:  "${path}"`
			);
			this.singlePool.main.currentTime = this.singlePool.playback.currentTime = 0;
		}

		this.playGroup(this.singlePool);
	}

	public addToMultiPool(audioGroup: AudioPoolGroup): void {
		AudioStoreManager.log(
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
		try {
			group.main.play();
			group.playback.play();
		} catch (e) {
			console.error(e);
		}
	}

	public setVolume(value: number): void {
		this.singlePool.main.volume = this.singlePool.playback.volume = value;

		if (this.multiPool.hasAudio) this.multiPool.volume = value;
	}

	private stopMultiPoolAudio(): void {
		if (this.multiPool.hasAudio) this.multiPool.stop();
	}
}
