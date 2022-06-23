class AudioPlayer extends LogExtend {
	private static _volume: number = 0;
	private static $volumeSlider: JQuery<HTMLElement>;
	private static maxSliderValue = 1000;

	private static canLogVolume: boolean = true;

	private static audioStore: AudioStoreManager = new AudioStoreManager();

	private static audioDevices: MediaDeviceInfo[];

	public static async updateAudioDevicesList(): Promise<void> {
		const devices = await navigator.mediaDevices.enumerateDevices();

		this.audioDevices = devices.filter(({ kind }) => kind === "audiooutput");
		this.audioStore.updateAudioDevice(this.audioDevices[2]); // TODO: Store preferred device

		this.log(
			this.updateAudioDevicesList,
			"Devices list updated!\n",
			this.audioDevices
		);
	}

	public static setVolumeSlider($slider: JQuery<HTMLElement>): void {
		this.log(this.setVolumeSlider, "Slider set!\n", $slider);
		this.$volumeSlider = $slider;
		this.maxSliderValue = parseInt(this.$volumeSlider.attr("max"));
		this.updateVolume();
		this.initSliderEvents();
	}

	private static initSliderEvents(): void {
		this.$volumeSlider
			.on("input", () => {
				this.updateVolume();
			})
			.on("wheel", (e) => {
				EventFunctions.updateInputValueFromWheel(e, 50, true, ["input"]);
			});
	}

	public static addAudio(path: string, useMultiPool: boolean = false): void {
		this.log(
			this.addAudio,
			`Trying to use path "%c%s%c"`,
			"font-style: italic",
			path,
			"font-style: normal"
		);
		this.tryAddAudio(path, useMultiPool);
	}

	private static tryAddAudio(path: string, useMultiPool: boolean): void {
		if (!useMultiPool) {
			this.audioStore.addAudioOrPath(path);
			return;
		}

		// The next audio goes to the multi-pool

		let mainAudio = new Audio(path) as AudioJS;

		$(mainAudio)
			.one("canplay", (e) => {
				this.storeAudio(e.target as AudioJS);
			})
			.one("error", (e) => {
				this.error(
					this.tryAddAudio,
					"Error loading audio\n",
					`(Code ${e.target.error.code}) "${e.target.error.message}"\n`,
					e
				);
			});
	}

	private static async storeAudio(mainAudio: AudioJS): Promise<void> {
		const main = mainAudio;
		const playback = mainAudio.cloneNode() as AudioJS;

		const group: AudioPoolGroup = {
			main,
			mainEnded: false,
			playback,
			playbackEnded: false,
			forcedEnding: false,
		};

		main.volume = playback.volume = this.volume;

		await this.setSinkId(main);

		this.audioStore.addToMultiPool(group);
	}

	private static async setSinkId(audio: AudioJS): Promise<void> {
		if (!this.audioDevices) await this.updateAudioDevicesList();

		await audio.setSinkId(this.audioDevices[2].deviceId);
	}

	public static async play(): Promise<void> {
		await this.audioStore.play();
	}

	public static pause(): void {
		this.audioStore.pause();
	}

	public static stop(): void {
		this.audioStore.stop();
	}

	public static get isPlaying(): boolean {
		return this.audioStore.isPlaying;
	}

	public static get volume(): number {
		return this._volume;
	}

	private static updateVolume(): void {
		let value = (this.$volumeSlider.val() as number) / this.maxSliderValue;

		value = EMath.getEponentialValue(value, 10);

		this._volume = value;
		this.updateExistingVolumes();

		// Log after some time to avoid spamming
		if (this.canLogVolume) {
			this.canLogVolume = false;

			this.log(this.updateVolume, "Volume:", Math.round(this._volume * 100), "%");

			setTimeout(() => {
				this.canLogVolume = true;
			}, 500);
		}
	}

	private static updateExistingVolumes(): void {
		this.audioStore.setVolume(this._volume);
	}
}
