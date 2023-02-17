abstract class StringUtilities {
	public static encodeFilePath(path: string): string {
		// Local files (at least on Windows) have backslashes instead of forward slashes. This causes problems since JS treats them as escaping characters.
		return encodeURIComponent(path.replace(/\\/g, "/"))
			.replace(/%2F/g, "\\") // Replace encoded slashes with backslashes
			.replace(/%3A/g, ":"); // Decode colons
	}

	/**
	 * Returns as `hsl()` function as a string.
	 *
	 * @param str The string that will be converted to a hue value
	 * @param saturation The saturation level
	 * @param lightness The lightness level
	 * @returns
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
	 * @param str The string to convert.
	 * @returns The hue value.
	 */
	public static getHue(str: string): number {
		const hash = this.getHash(str);

		// Result will always be between -360 and 360 with the remainder operator
		const result = hash % 360;

		return result < 0 ? result + 360 : result;
	}

	/**
	 * Converts a string to an hash code.
	 *
	 * @see {@link https://stackoverflow.com/a/7616484/16804863}
	 * @param str The string to convert
	 * @returns The hash code
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
	 * Returns the date without timezone offset.
	 *
	 * @see {@link https://stackoverflow.com/a/39209842}
	 */
	public static UTCDate(date: Date): Date {
		const offset = date.getTimezoneOffset() * 60000;
		return new Date(date.getTime() - offset);
	}
}
