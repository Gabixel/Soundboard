abstract class AudioPlayer extends Logger {
	private static _volume: number = 0;
	private static _$volumeSlider: JQuery<HTMLInputElement>;
	private static _maxSliderValue = 1000;

	private static _audioStore: AudioStoreManager = new AudioStoreManager();

	private static _audioDevices: MediaDeviceInfo[];

	private static _$playToggleButtonIcon: JQuery<HTMLElement>;
	private static _playToggleButtonIconInterval: NodeJS.Timer;
	private static _playToggleButtonIconIntervalLocked: boolean;

	public static async updateAudioDevicesList(): Promise<void> {
		// Get audio output devices
		const devices = await navigator.mediaDevices.enumerateDevices();
		this._audioDevices = devices.filter(({ kind }) => kind === "audiooutput");

		this._audioDevices.forEach((device, i) => {
			$("#audio-output-select").append(
				$("<option>", {
					value: i,
					text: i + 1 + " - " + device.label,
				})
			);
		});

		// FIXME: Store preferred device
		// this is all temporarily just for visuals
		$("#audio-output-select>option:eq(2)").prop("selected", true);
		this._audioStore.updateAudioDevice(this._audioDevices[2]);

		this.logInfo(
			this.updateAudioDevicesList,
			"Devices list updated!\n",
			this._audioDevices
		);
	}

	public static setAudioButtons(
		$playToggleButton: JQuery<HTMLButtonElement>,
		$stopButton: JQuery<HTMLButtonElement>
	): typeof AudioPlayer {
		// Icon inside the play toggle button
		this._$playToggleButtonIcon = $playToggleButton.children("i.fa-play");

		// Buttons events
		$playToggleButton
			// On play toggle click
			.on("click", () => {
				if (this._audioStore.isPlaying) {
					AudioPlayer.pause();
				} else {
					AudioPlayer.play();
				}
			});
		$stopButton.on("click", () => {
			this.logInfo(this.setAudioButtons, "Stop audio button clicked");
			AudioPlayer.stop();
		});

		// Play toggle button icon updater
		// FIXME: Use an array / a semaphore system to check when to change the icon instead of an interval
		let iconUpdater = setInterval(() => {
			if (this._playToggleButtonIconIntervalLocked) {
				return;
			}

			this.updatePlayToggleButton();
		}, 10);
		Main.addInterval(iconUpdater);
		this._playToggleButtonIconInterval = iconUpdater;

		return this;
	}

	private static updatePlayToggleButton() {
		this._playToggleButtonIconIntervalLocked = true;

		let isPlaying = this._audioStore.isPlaying;

		this._$playToggleButtonIcon
			.toggleClass("fa-pause", isPlaying)
			.toggleClass("fa-play", !isPlaying);

		this._playToggleButtonIconIntervalLocked = false;
	}

	public static setVolumeSlider(
		$slider: JQuery<HTMLInputElement>
	): typeof AudioPlayer {
		this.logInfo(this.setVolumeSlider, "Slider set!\n", $slider);
		this._$volumeSlider = $slider;
		this._maxSliderValue = parseInt(this._$volumeSlider.attr("max"));
		this.updateVolume();
		this.initSlider();

		return this;
	}

	private static initSlider(): void {
		this._$volumeSlider
			// On input changes
			.on("input", () => {
				this.updateVolume();
			});
		// .on("blur", (e) => {
		// 	this.$volumeSlider.trigger("input");
		// })

		// Update volume slider on scroll (only when control is not active)
		this._$volumeSlider
			.parent()
			// On scroll wheel
			.on("wheel", { passive: true }, (e) => {
				if (e.ctrlKey) return;
				// e.preventDefault();
				e.stopImmediatePropagation();
				EventFunctions.updateInputValueFromWheel(e, this._$volumeSlider, 50, [
					"input",
				]);
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

		this.createAndPlayAudio(path, time, useMultiPool);
	}

	private static createAndPlayAudio(
		path: string,
		time: AudioTimings,
		useMultiPool: boolean
	): void {
		if (!useMultiPool) {
			this._audioStore.addToSinglePool(path, time);
			return;
		}

		// Limited sounds to prevent memory or human ear issues
		if (this._audioStore.isLimitReached) {
			this.logWarn(this.createAndPlayAudio, "Pool limit exceeded.");
			return;
		}

		let mainAudio = new Audio(path) as AudioJS;

		$(mainAudio)
			.one("canplay", (e) => {
				this.logInfo(
					this.createAndPlayAudio,
					"Audio file created. Duration: " + e.target.duration + " seconds"
				);
				this.storeAudio(e.target, time);
			})
			.one("error", (e) => {
				this.logError(
					this.createAndPlayAudio,
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
		// Create multi audio pool group
		const main = mainAudio;
		const playback = mainAudio.cloneNode() as AudioJS;
		const group: AudioPoolGroup = {
			main,
			playback,
			$all: $(main).add($(playback)),
			all: (func) => {
				func(main);
				func(playback);
			},
			ended: false,
			forcedStop: false,
		};

		main.volume = playback.volume = this.volume;
		main.currentTime = playback.currentTime = time.start / 1000;

		await this.setSinkId(main);

		this._audioStore.addToMultiPool(group);
	}

	private static async setSinkId(audio: AudioJS): Promise<void> {
		if (!this._audioDevices) await this.updateAudioDevicesList();

		await audio.setSinkId(this._audioDevices[2].deviceId);
	}

	public static async play(): Promise<void> {
		await this._audioStore.play();
	}

	public static pause(): void {
		this._audioStore.pause();
	}

	public static stop(): void {
		this._audioStore.stop();
	}

	public static get isPlaying(): boolean {
		return this._audioStore.isPlaying;
	}

	public static get volume(): number {
		return this._volume;
	}

	private static updateVolume(): void {
		let value = (this._$volumeSlider.val() as number) / this._maxSliderValue;

		value = EMath.getExponentialValue(value, 4);

		this._volume = value;
		this.updateExistingVolumes();

		// Log new volume
		this.logDebug(this.updateVolume, "Volume:", value);
	}

	private static updateExistingVolumes(): void {
		this._audioStore.setVolume(this._volume);
	}
}
