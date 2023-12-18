abstract class StringUtilities {
	/**
	 * Encodes a file path by replacing backslashes with forward slashes and encoding special characters.
	 *
	 * @param path - The file path to encode
	 * @returns The encoded path
	 */
	public static encodeFilePath(path: string): string {
		// Local files (at least on Windows) have backslashes instead of forward slashes. This causes problems since JS treats them as escaping characters.
		return encodeURIComponent(path.replace(/\\/g, "/"))
			.replace(/%2F/g, "\\") // Replace encoded slashes with backslashes
			.replace(/%3A/g, ":"); // Decode colons
	}

	/**
	 * Returns an `hsl()` function as a string.
	 *
	 * @param str The string that will be use to extract a hue value
	 * @param saturation The saturation level
	 * @param lightness The lightness level
	 */
	public static getHSL(
		str: string,
		saturation: number = 100,
		lightness: number = 50
	): string {
		return `hsl(${this.getHue(str)}, ${saturation}%, ${lightness}%)`;
	}

	/**
	 * Returns the hue value for a given string.
	 * This can be used for HSL colors.
	 *
	 * @param str - The string to convert
	 * @returns The hue value
	 */
	public static getHue(str: string): number {
		const hash = this.getHash(str);

		// Result will always be between -360 and 360 with the remainder operator
		const result = hash % 360;

		return result < 0 ? result + 360 : result;
	}

	/**
	 * Calculates the hash value of a given string.
	 *
	 * @see {@link https://stackoverflow.com/a/7616484/16804863}
	 * @param str - The string to calculate the hash for
	 * @returns The hash value of the string
	 */
	public static getHash(str: string) {
		let hash = 0;
		if (str.length === 0) return hash;

		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash |= 0; // Convert to 32bit integer
		}

		return hash;
	}

	/**
	 * Converts RGB color values to a hexadecimal string representation.
	 *
	 * @param r - The red component value (0-255)
	 * @param g - The green component value (0-255)
	 * @param b - The blue component value (0-255)
	 * @returns The hexadecimal representation of the RGB color
	 */
	public static RGBToHex(r: number, g: number, b: number): string {
		return (
			EMath.componentToHex(r) + EMath.componentToHex(g) + EMath.componentToHex(b)
		);
	}

	/**
	 * Converts HSL color values to a hexadecimal color string.
	 * @param h - The hue value (0-360)
	 * @param s - The saturation value (0-1)
	 * @param l - The lightness value (0-1)
	 * @returns The hexadecimal color string
	 */
	public static HSLToHex(h: number, s: number, l: number): string {
		return StringUtilities.RGBToHex(...EMath.HSLToRGB(h, s, l));
	}

	/**
	 * Returns the date without timezone offset.
	 *
	 * @see {@link https://stackoverflow.com/a/39209842}
	 */
	public static UTCDate(date: Date): Date {
		const offset = date.getTimezoneOffset() * 60000;
		return new Date(date.getTime() - offset);
	}

	/**
	 * Sets up prototype extensions for the {@link StringConstructor} interface.
	 */
	public static setupStringPrototypeExtensions(): void {
		String.prototype.getHSL = function getHSL(
			saturation: number = 100,
			lightness: number = 50
		): string {
			return StringUtilities.getHSL(this as string, saturation, lightness);
		};
	}
}
