class AudioPlayer {
	private static _volume: number = 0;

	// private static context: AudioContext = new AudioContext();
	// private static panner: StereoPannerNode = this.context.createStereoPanner();

	private static audioStore: AudioStoreManager = new AudioStoreManager();

	// private static mediaList: AudioNode[] = []; // TODO: audio context
	private static audioDevices: MediaDeviceInfo[];

	public static async updateAudioDevicesList(): Promise<void> {
		const devices = await navigator.mediaDevices.enumerateDevices();

		this.audioDevices = devices.filter(({ kind }) => kind === "audiooutput");
		this.audioStore.updateAudioDevice(this.audioDevices[2]); // TODO: store preferred device

		console.log("Devices updated: " + this.audioDevices.length);
		console.log(this.audioDevices);
	}

	/*
	public static updateAudioDevicesList(): void {
		navigator.mediaDevices.enumerateDevices().then(
			(devicesList) => {
				this.setAudioDevicesList(devicesList);
			},
			(err) => {
				console.log(err);
			}
		);
	}

	private static setAudioDevicesList(devices: MediaDeviceInfo[]): void {
		this.audioDevices = devices;

		console.log("Devices updated: " + devices.length);
		console.log(devices);

		this.audioDevices = devices.filter(({ kind }) => kind === "audiooutput");
		this.audioStore.updateAudioDevice(this.audioDevices[2]); // TODO: store preferred device
	}
	*/

	public static initVolume(): void {}

	public static addAudio(path: string, useMultiPool: boolean = false): void {
		this.tryAddAudio(path, useMultiPool);
	}

	private static tryAddAudio(path: string, useMultiPool: boolean): void {
		if (!useMultiPool) {
			this.audioStore.addAudioOrPath(path);
			return;
		}

		let audioGroup = new Audio(path) as AudioJS;

		$(audioGroup).one("canplay", (e) => {
			this.storeAudio(e.target as AudioJS);
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

		this.audioStore.addAudioOrPath(group);
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

	public static set volume(value: number) {
		this._volume = EMath.getEponentialVolume(value, 10);
		this.updateExistingVolumes();
		console.log("New volume: " + this._volume);
	}

	private static updateExistingVolumes(): void {
		this.audioStore.setVolume(this._volume);
	}

	public static setPan(pan: number): void {
		// this.panner.pan.value = EMath.clamp(pan, -1, 1);
	}
}
