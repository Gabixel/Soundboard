interface Window {
	api: WindowApiBridge;
}

interface String {
	/**
	 * Returns an `hsl()` function as a string.
	 *
	 * @param str The string that will be converted to a hue value
	 * @param saturation The saturation level
	 * @param lightness The lightness level
	 */
	getHSL(saturation: number, lightness: number): string;
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
