interface Window {
	api: WindowApiBridge;
}

interface HTMLAudioElement {
	async setSinkId(deviceId: string): Promise<undefined>;
	sinkId: string;
}