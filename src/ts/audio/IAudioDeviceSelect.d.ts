interface IAudioDeviceSelect {
	getOutputDevices(): Promise<MediaDeviceInfo[]>;
	setDevice(device: MediaDeviceInfo | number): void;
}