/**
 * Manager for audio output devices and their selection.
 */
class AudioDeviceSelect implements IAudioDeviceSelect {
	private static VAC_NAME = "Virtual Audio Cable (VB-Audio Virtual Cable)";

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

	public async getOutputDevices(): Promise<MediaDeviceInfo[]> {
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

	private get selectedIndex(): number {
		return parseInt(this._$audioDevicesSelect.val() as string);
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
		let newDevices = await this.getOutputDevices();

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

		this.hardCodeVACToDefault();

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
		this._$audioDevicesSelect.on("change", () => {
			const audioIndex = this.selectedIndex;

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

		// TODO: can be moved above if hardcoded VAC gets removed
		// Note: if there'll be a save/load system, this probably needs to stay here
		await this.updateAll();

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
	 * Hardcoded method to apply the Virtual Audio Cable as default output, if present.
	 */
	private hardCodeVACToDefault(): void {
		let VACIndex = -1;

		const hasVAC = this._cachedDevices.some((device, i) => {
			if (device.label != AudioDeviceSelect.VAC_NAME) {
				return false;
			}

			VACIndex = i;
			return true;
		});

		if (!hasVAC) {
			return;
		}

		this._$audioDevicesSelect
			.find(`>option:eq(${VACIndex})`)
			.prop("selected", true);
	}
}
