abstract class AudioPlayer extends Logger {
	private static _volume: number = 0;
	private static $volumeSlider: JQuery<HTMLElement>;
	private static maxSliderValue = 1000;

	private static canLogVolume: boolean = true;

	private static audioStore: AudioStoreManager = new AudioStoreManager();

	private static audioDevicesInfo: MediaDeviceInfo[];

	public static async updateAudioDevicesList(): Promise<void> {
		// Get audio output devices
		const devices = await navigator.mediaDevices.enumerateDevices();
		this.audioDevicesInfo = devices.filter(({ kind }) => kind === "audiooutput");

		// FIXME: Store preferred device
		this.audioStore.updateAudioDevice(this.audioDevicesInfo[2]);

		this.logInfo(
			this.updateAudioDevicesList,
			"Devices list updated!\n",
			this.audioDevicesInfo
		);
	}

	public static setVolumeSlider($slider: JQuery<HTMLElement>): void {
		this.logInfo(this.setVolumeSlider, "Slider set!\n", $slider);
		this.$volumeSlider = $slider;
		this.maxSliderValue = parseInt(this.$volumeSlider.attr("max"));
		this.updateVolume();
		this.initSlider();
	}

	private static initSlider(): void {
		this.$volumeSlider
			// On input changes
			.on("input", () => {
				this.updateVolume();
			});
		// .on("blur", (e) => {
		// 	this.$volumeSlider.trigger("input");
		// })

		// Update volume slider on scroll (only when control is not active)
		this.$volumeSlider
			.parent()
			// On scroll wheel
			.on("wheel", { passive: true }, (e) => {
				if (e.ctrlKey) return;
				// e.preventDefault();
				e.stopImmediatePropagation();
				EventFunctions.updateInputValueFromWheel(e, this.$volumeSlider, 50, ["input"]);
			});
	}

	public static addAudio(
		path: string,
		time: AudioTimings,
		useMultiPool: boolean = false
	): void {
		this.logInfo(
			this.addAudio,
			`Using path "%c${path}%c"%s`,
			"color: #03fc98;",
			"",
			"\n- Start time:",
			time.start,
			"(ms)\n- End time:",
			time.end,
			`(ms)\n- Condition: "${time.condition}"`
		);

		// TODO: clamp time? (e.g. -1000ms = 0ms)
		
		this.tryAddAudio(path, time, useMultiPool);
	}

	private static tryAddAudio(
		path: string,
		time: AudioTimings,
		useMultiPool: boolean
	): void {
		if (!useMultiPool) {
			this.audioStore.addToSinglePool(path, time);
			// this.audioStore.addToSinglePool(path, startTime, endTime, endType);
			return;
		}

		let mainAudio = new Audio(path) as AudioJS;

		$(mainAudio)
			.one("canplay", (e) => {
				this.logInfo(
					this.tryAddAudio,
					"Audio file created. Duration: " + e.target.duration + " seconds"
				);
				this.storeAudio(e.target as AudioJS, time);
			})
			.one("error", (e) => {
				this.logError(
					this.tryAddAudio,
					"Error loading audio\n",
					`(Code ${e.target.error.code}) "${e.target.error.message}"\n`,
					e
				);
			});
	}

	private static async storeAudio(
		mainAudio: AudioJS,
		time: AudioTimings
	): Promise<void> {
		const main = mainAudio;
		const playback = mainAudio.cloneNode() as AudioJS;

		const group: AudioPoolGroup = {
			main,
			playback,
			ended: false,
			forcedStop: false,
		};

		main.volume = playback.volume = this.volume;
		main.currentTime = playback.currentTime = time.start / 1000;

		await this.setSinkId(main);

		this.audioStore.addToMultiPool(group);
	}

	private static async setSinkId(audio: AudioJS): Promise<void> {
		if (!this.audioDevicesInfo) await this.updateAudioDevicesList();

		await audio.setSinkId(this.audioDevicesInfo[2].deviceId);
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

		value = EMath.getExponentialValue(value);

		this._volume = value;
		this.updateExistingVolumes();

		// Log after some time to avoid spamming
		if (this.canLogVolume) {
			this.canLogVolume = false;

			this.logDebug(this.updateVolume, "Volume:", Math.round(this._volume * 100), "%");

			setTimeout(() => {
				this.canLogVolume = true;
			}, 500);
		}
	}

	private static updateExistingVolumes(): void {
		this.audioStore.setVolume(this._volume);
	}
}
