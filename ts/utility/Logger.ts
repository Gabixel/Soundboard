class Logger {
	public static log(...args: any[]): void {
		console.log(...args);
	}
}

class LogExtend {
	protected static log(...args: any[]): void {
		Logger.log(
			`(%c${this.name}%c)`,
			"color: yellow;",
			"color: inherit;",
			...args
		);
	}
}
