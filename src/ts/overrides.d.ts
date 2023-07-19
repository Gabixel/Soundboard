interface Window {
	api: WindowApiBridge;
}

interface HTMLAudioElement {
	setSinkId(deviceId: string): Promise<undefined>;
	sinkId: string;
}

interface AudioContext {
	setSinkId(deviceId: string): Promise<undefined>;
	sinkId: string;
}

interface File {
	path: string;
	name: string;
}
