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

	private async cacheDevices(): Promise<void> {
		this._cachedDevices = await this.getDevices();
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

	private initializeDeviceManager(): void {
		this.cacheDevices().then(() => {
			this.refreshDeviceSelect();

			this._$audioDevicesSelect.on("change", () => {
				const audioIndex = parseInt(this._$audioDevicesSelect.val() as string);

				Logger.logDebug(
					`Audio output device changed from dropdown.\n( id: ${audioIndex}, label: %c"${this._$audioDevicesSelect
						.children("option:selected")
						.text()}"%c )`,
					"font-style: italic;",
					"font-style: normal;"
				);

				this.setDevice(audioIndex);
			});
		});
	}

	/**
	 * Hardcoded method to apply the Virtual Audio Cable, if present.
	 */
	private hardCodeVAC(): void {}
}
