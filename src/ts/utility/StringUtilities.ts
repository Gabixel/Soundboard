abstract class StringUtilities {
	public static encodeFilePath(path: string): string {
		// Local files (at least on Windows) have backslashes instead of forward slashes. This causes problems since JS treats them as escaping characters.
		return encodeURIComponent(path.replace(/\\/g, "/"))
			.replace(/%2F/g, "/") // Replace slashes
			.replace(/%3A/g, ":"); // Replace colons
	}
}
