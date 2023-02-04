abstract class StringUtilities {
	public static encodeFilePath(path: string): string {
		// Local files (at least on Windows) have backslashes instead of forward slashes. This causes problems since JS treats them as escaping characters.
		return encodeURIComponent(path.replace(/\\/g, "/"))
			.replace(/%2F/g, "\\") // Replace encoded slashes with backslashes
			.replace(/%3A/g, ":"); // Decode colons
	}

	public static getHsl(str: string, lightness: number) {
		return `hsl(${this.getHue(str)}, 100%, ${lightness}%)`;
	}

	public static getHue(str: string) {
		let hash = this.getHash(str);

		const result = hash % 360;
		if (result < 0) return result + 360;
		else return result;
	}

	/**
	 * Converts a string to an hash code.
	 *
	 * See {@link https://stackoverflow.com/a/7616484/16804863}.
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
}
