abstract class AudioPlayer extends Logger {
	private static _singlePoolVolumeSlider: VolumeSlider;
	private static _multiPoolVolumeSlider: VolumeSlider;

	private static _audioStore: AudioStoreManager = new AudioStoreManager();

	private static _$audioDevicesSelect: JQuery<HTMLInputElement>;
	private static _audioDevices: MediaDeviceInfo[];
	public static get audioDevices(): MediaDeviceInfo[] {
		return this._audioDevices;
	}
	private static _currentAudioDevice: MediaDeviceInfo;
	private static _audioDevicesInitialized: boolean = false;

	private static _$playToggleButtonIcon: JQuery<HTMLElement>;
	private static _playToggleButtonIconInterval: NodeJS.Timer;
	private static _playToggleButtonIconIntervalLocked: boolean;

	public static async initializeAudioDevices(): Promise<void> {
		this._$audioDevicesSelect = $("#audio-output-select");

		// Fill device array and dropdown, and set audio device
		await this.refreshAudioDevices();

		this._$audioDevicesSelect.on("change", () => {
			let audioIndex = +this._$audioDevicesSelect.val();

			this.logDebug(
				"(audio device dropdown change)",
				"Main output dropdown triggered change\n",
				`ID: ${audioIndex}\n`,
				`Option label: '${this._$audioDevicesSelect
					.children("option:selected")
					.text()}'`
			);

			// const audioIndex = this._$audioDevicesSelect.prop("selectedIndex") as number;
			this.setAudioDevice(audioIndex);
		});

		// FIXME: Remove this hardcoded thing
		// Temporarily hardcoded "Virtual Audio Cable" output as default for main output
		this.hardCodeVirtualAudioCableAsDefault();

		// Update audio devices dropdown and array on device change event
		navigator.mediaDevices.ondevicechange = async (_e) => {
			await this.refreshAudioDevices();

			this.hardCodeVirtualAudioCableAsDefault();

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

	/**
	 * Refreshes devices array and dropdown
	 */
	private static async refreshAudioDevices(): Promise<void> {
		await this.refreshAudioDevicesArray();
		this.refreshAudioDevicesDropdown();
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

	private static setAudioDevice(device: number | MediaDeviceInfo): void {
		// If the OS has at least one output
		if (this._audioDevices.length > 0) {
			if (typeof device != "number") {
				this._audioStore.setAudioDevice(device);
				this._currentAudioDevice = device;

				this.logInfo(
					this.setAudioDevice,
					`Audio device changed to '${device.label}'\n`,
					device
				);
			} else if (
				device >= 0 &&
				StringUtilities.isDefined(this._audioDevices[device])
			) {
				this._audioStore.setAudioDevice(this._audioDevices[device]);
				this._currentAudioDevice = this._audioDevices[device];

				this.logInfo(
					this.setAudioDevice,
					`Audio device changed to '${this._audioDevices[device].label}'\n`,
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

	public static initVolumeSliders(
		$singlePoolSlider: JQuery<HTMLInputElement>,
		$multiPoolSlider: JQuery<HTMLInputElement>
	): typeof AudioPlayer {
		const decimals = 4;
		const exponentialBase = 100;

		this._singlePoolVolumeSlider = new VolumeSlider(
			$singlePoolSlider,
			() => {
				// Update existing audio volume
				this._audioStore.setSinglePoolVolume(this._singlePoolVolumeSlider.value);

				// Log new volume
				this.logDebug(
					"(single pool volume slider change)",
					"Volume:",
					this._singlePoolVolumeSlider.value
				);
			},
			decimals,
			exponentialBase
		);

		this._multiPoolVolumeSlider = new VolumeSlider(
			$multiPoolSlider,
			() => {
				// Update existing audio volume
				this._audioStore.setMultiPoolVolume(this._multiPoolVolumeSlider.value);

				// Log new volume
				this.logDebug(
					"(multi pool volume slider change)",
					"Volume:",
					this._multiPoolVolumeSlider.value
				);
			},
			decimals,
			exponentialBase
		);

		this._singlePoolVolumeSlider.$slider.trigger("input");
		this._multiPoolVolumeSlider.$slider.trigger("input");

		this.logInfo(
			this.initVolumeSliders,
			"Sliders set!\n",
			$singlePoolSlider,
			"\n",
			$multiPoolSlider
		);

		return this;
	}

	public static addAudio(
		path: string,
		time: AudioTimings,
		useMultiPool: boolean = false
	): void {
		if (!StringUtilities.isDefined(path)) {
			return Logger.logDebug(this.addAudio, "Path is not defined");
		}

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

		main.volume = playback.volume = this._multiPoolVolumeSlider.value;
		main.currentTime = playback.currentTime = time.start / 1000;

		main.setSinkId(this._currentAudioDevice.deviceId);

		this._audioStore.addToMultiPool(group);
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
}
