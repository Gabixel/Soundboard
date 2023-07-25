/**
 * Manager for audio output devices and their selection.
 */
class AudioDeviceSelect implements IAudioDeviceSelect {
	private _$audioDevicesSelect: JQuery<HTMLSelectElement>;
	private _audioPlayer: AudioPlayer;

	private _cachedDevices: MediaDeviceInfo[] = [];
	public get defaultDevices(): MediaDeviceInfo {
		return this._cachedDevices[0];
	}
	public get defaultCommunicationDevice(): MediaDeviceInfo {
		return this._cachedDevices[1];
	}

	constructor(
		$audioDevicesSelect: JQuery<HTMLSelectElement>,
		audioPlayer: AudioPlayer
	) {
		this._$audioDevicesSelect = $audioDevicesSelect;
		this._audioPlayer = audioPlayer;

		this.initializeDeviceManager();

		Logger.logDebug("Initialized!");
	}

	public async getDevices(): Promise<MediaDeviceInfo[]> {
		const allDevices = await navigator.mediaDevices.enumerateDevices();
		return allDevices.filter(({ kind }) => kind === "audiooutput");
	}

	public setDevice(device: MediaDeviceInfo | number): void {
		if (typeof device != "number") {
			this._audioPlayer.setSinkId(device.deviceId);
		} else {
			if (device == 0) {
				// Set to default device
				this._audioPlayer.setSinkId("");
				Logger.logDebug(
					"Audio id is 0, sinkId will be emptied to make the AudioContext decide based on the default output device."
				);
				return;
			}

			this._audioPlayer.setSinkId(
				this._cachedDevices?.[device].deviceId ??
					this.defaultCommunicationDevice.deviceId
			);
		}
	}

	private async cacheDevices(devices: MediaDeviceInfo[]): Promise<void> {
		this._cachedDevices = devices;
	}

	private refreshDeviceSelect(): void {
		let newList: JQuery<HTMLOptionElement>[] = [];

		this._cachedDevices.forEach((device, i) => {
			newList.push(
				$("<option>", {
					value: i,
					text: device.label,
				})
			);
		});

		this._$audioDevicesSelect.empty();
		this._$audioDevicesSelect.append(newList);
	}

	private async updateAll(
		checkForDifferentArray: boolean = false
	): Promise<void> {
		let newDevices = await this.getDevices();

		if (
			checkForDifferentArray &&
			this.areMediaDeviceArraysEqual(this._cachedDevices, newDevices)
		) {
			Logger.logDebug(
				"Updated (output) media devices are the same, no need to update."
			);
			return;
		}

		await this.cacheDevices(newDevices);

		this.refreshDeviceSelect();

		// This gets triggered even at startup, but we don't care since the event hasn't been captured yet
		this._$audioDevicesSelect.trigger("change");
	}

	private areMediaDeviceArraysEqual(
		arr1: MediaDeviceInfo[],
		arr2: MediaDeviceInfo[]
	) {
		// Check if both arrays have the same length
		if (arr1.length !== arr2.length) {
			return false;
		}

		// If all elements match, the arrays are equal
		return arr1.every((device1, i) => {
			let device2 = arr2[i];

			return (
				device1.deviceId !== device2.deviceId || device1.kind !== device2.kind
			);
		});
	}

	private async initializeDeviceManager(): Promise<void> {
		await this.updateAll();

		this._$audioDevicesSelect.on("change", () => {
			const audioIndex = parseInt(this._$audioDevicesSelect.val() as string);

			Logger.logDebug(
				`Audio output device changed from dropdown.\n` +
					`( id: ${audioIndex}, label: %c"${this._$audioDevicesSelect
						.children("option:selected")
						.text()}"%c )`,
				"font-style: italic;",
				"font-style: normal;"
			);

			this.setDevice(audioIndex);
		});

		navigator.mediaDevices.ondevicechange = (e) => {
			// Debounce logic to prevent weird multiple calls from some input/output devices
			MainWindow.removeTimeout("ondevicechange_debounce");
			MainWindow.addTimeout(
				"ondevicechange_debounce",
				setTimeout(() => {
					this.updateAll(true);
					Logger.logDebug("Media devices triggered an update.\n", e, {
						class: AudioDeviceSelect,
						function: "mediaDevices.ondevicechange",
					});
				}, 200)
			);
		};
	}

	/**
	 * Hardcoded method to apply the Virtual Audio Cable, if present.
	 */
	private hardCodeVAC(): void {}
}
