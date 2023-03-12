interface Window {
	api: WindowApiBridge;
}

interface HTMLAudioElement {
	setSinkId(deviceId: string): Promise<undefined>;
	sinkId: string;
}