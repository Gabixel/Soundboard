abstract class AudioPlayer extends Logger {
	private static _volume: number = 0;
	private static _$volumeSlider: JQuery<HTMLInputElement>;
	private static _maxSliderValue = 1000;

	private static _audioStore: AudioStoreManager = new AudioStoreManager();

	private static _$audioDevicesSelect: JQuery<HTMLInputElement>;
	private static _audioDevices: MediaDeviceInfo[];
	private static _audioDevicesInitialized: boolean = false;

	private static _$playToggleButtonIcon: JQuery<HTMLElement>;
	private static _playToggleButtonIconInterval: NodeJS.Timer;
	private static _playToggleButtonIconIntervalLocked: boolean;

	public static async initializeAudioDevices(): Promise<void> {
		this._$audioDevicesSelect = $("#audio-output-select");

		// Fill device array
		await this.refreshAudioDevicesArray();

		// Fill dropdown list
		this.refreshAudioDevicesDropdown();

		this._$audioDevicesSelect.on("change", () => {
			let audioIndex = +this._$audioDevicesSelect.val();

			this.logDebug(
				"(audio device dropdown change)",
				"Dropdown triggered change\n",
				`ID: ${audioIndex}\n`,
				`Option label: '${this._$audioDevicesSelect.children("option:selected").text()}'`
			);

			// const audioIndex = this._$audioDevicesSelect.prop("selectedIndex") as number;
			this.updateAudioDevice(audioIndex);
		});

		// FIXME: Remove this hardcoded thing
		// Temporarily hardcoded "Virtual Audio Cable" output as default for main output
		this.hardCodeVirtualAudioCableAsDefault();

		// Update audio devices dropdown and array on device change event
		navigator.mediaDevices.ondevicechange = (_e) => {
			// TODO: update output and try keeping the previous one
			// also, check if the audio changed came from audio output or not
			console.log("DEVICE CHANGE EVENT ", _e);
		};

		this._audioDevicesInitialized = true;

		this.logInfo(
			this.initializeAudioDevices,
			"Devices initialized!\n",
			this._audioDevices
		);
	}

	private static refreshAudioDevicesDropdown(): void {
		this._$audioDevicesSelect.empty();

		// Append audio devices to dropdown (if the OS has at least one)
		if (this._audioDevices.length > 0) {
			this._audioDevices.forEach((device, i) => {
				this._$audioDevicesSelect.append(
					$("<option>", {
						value: i,
						text: device.label,
					})
				);
			});
		} else {
			this._$audioDevicesSelect.append(
				$("<option>", {
					value: -1,
					text: "(None)",
				})
			);
		}
	}

	private static async refreshAudioDevicesArray(): Promise<void> {
		// Get audio output devices
		const devices = await navigator.mediaDevices.enumerateDevices();
		this._audioDevices = devices.filter(({ kind }) => kind === "audiooutput");
	}

	private static hardCodeVirtualAudioCableAsDefault(): void {
		let virtualAudioCableIndex = -1;

		if (
			this._audioDevices.some((e, i) => {
				if (e.label === "Virtual Audio Cable (VB-Audio Virtual Cable)") {
					virtualAudioCableIndex = i;
					return true;
				}
				return false;
			})
		) {
			$(`#audio-output-select>option:eq(${virtualAudioCableIndex})`).prop(
				"selected",
				true
			);
			this._$audioDevicesSelect.trigger("change");
		}
	}

	private static updateAudioDevice(device: number | MediaDeviceInfo): void {
		// If the OS has at least one output
		if (this._audioDevices.length > 0) {
			if (typeof device != "number") {
				this._audioStore.updateAudioDevice(device);

				this.logInfo(
					this.updateAudioDevice,
					"Audio device changed to ",
					device
				);
			} else if (StringUtilities.isDefined(this._audioDevices[device])) {
				this._audioStore.updateAudioDevice(this._audioDevices[device]);

				this.logInfo(
					this.updateAudioDevice,
					"Audio device changed to:",
					this._audioDevices[device]
				);
			}
		}

		// TODO: add `else`s
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

		let mainAudio = new Audio(path);

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
		mainAudio: HTMLAudioElement,
		time: AudioTimings
	): Promise<void> {
		// Create multi audio pool group
		const main = mainAudio;
		const playback = mainAudio.cloneNode() as HTMLAudioElement;
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

	private static async setSinkId(audio: HTMLAudioElement): Promise<void> {
		if (this._audioDevicesInitialized) {
			// If the OS has at least one audio device
			if (this._audioDevices.length > 0) {
				// TODO: choose audio device output (for main and playback)
				await audio.setSinkId(this._audioDevices[2].deviceId);
			} else {
				this.logWarn(this.setSinkId, "No audio device available for output");
			}
		} else {
			this.logError(this.setSinkId, "Audio devices list is not initialized");
		}
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

		// Update existing audio volume
		this._audioStore.setVolume(this._volume);

		// Log new volume
		this.logDebug(this.updateVolume, "Volume:", value);
	}
}
