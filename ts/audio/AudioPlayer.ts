type AudioJS = HTMLAudioElement & {
	setSinkId(deviceId: string): Promise<undefined>;
	sinkId: string;
};

class AudioPlayer {
	private static _volume: number = 0.12;

	private static audioMain: AudioJS = new Audio() as AudioJS; // TODO
	private static audioTree: AudioJS[] = [];

	private static addingAudio: boolean = false;

	// constructor() {
	// 	const devices = await navigator.mediaDevices.enumerateDevices();
	// 	const audioDevices = devices.filter(({ kind }) => kind === "audiooutput");
	// }

	public static playAudio(path: string): void {
		this.createAudio(path);

		// TODO: add logic to check if the audio should play on `audioMain` or on `audioTree`.
	}

	private static createAudio(path: string): void {
		let audio: AudioJS = new Audio(path) as AudioJS;
		$(audio).one("canplay", (e) => this.addAudio(e.target as AudioJS));
	}

	private static async addAudio(audio: AudioJS) {
		if (this.addingAudio) return;

		this.addingAudio = true;

		await this.prepareAudio(audio);

		this.addingAudio = false;
	}

	private static async prepareAudio(audio: AudioJS): Promise<void> {
		const playback = audio.cloneNode() as AudioJS;
		this.audioTree.push(audio);
		this.audioTree.push(playback);

		$(audio).on("ended", this.removeAudio.bind(this, audio));
		$(playback).on("ended", this.removeAudio.bind(this, playback));

		const devices = await navigator.mediaDevices.enumerateDevices();
		const audioDevices = devices.filter(({ kind }) => kind === "audiooutput");

		const mainDevice = audioDevices[2]; // virtual audio cable (but can change after testing)
		// const playbackDevice = audioDevices[0]; // default device

		audio.loop = playback.loop = false;
		audio.volume = playback.volume = this.volume;

		try {
			await audio.play();
			await playback.play();
		} catch (e) {}

		await audio.setSinkId(mainDevice.deviceId);

		// No need to change the playback sink, it has to stay to the default device.
		// console.log("audio sink changed");
	}

	public static stop(): void {
		this.audioTree.forEach((audio) => {
			$(audio).attr("ending", "true");
			audio.volume = 0;
			audio.currentTime = audio.duration;
		});
	}

	private static removeAudio(audio: AudioJS): void {
		this.audioTree.splice(this.audioTree.indexOf(audio), 1);
	}

	public static get volume(): number {
		return this._volume;
	}

	public static set volume(value: number) {
		this._volume = EMath.getEponentialVolume(value);
		this.updateExistingVolumes();
	}

	private static updateExistingVolumes(): void {
		this.audioTree.forEach((audio) => {
			if ($(audio).attr("ending") === "true") return;

			audio.volume = this.volume;
		});
	}
}
