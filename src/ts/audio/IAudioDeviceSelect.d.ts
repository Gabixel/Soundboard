interface IAudioDeviceSelect {
	getDevices(): Promise<MediaDeviceInfo[]>;
	setDevice(device: MediaDeviceInfo | number): void;
}