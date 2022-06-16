class Logger {
	private static boldEffect: string =
		"text-shadow: 0 .5px 3px rgb(255 255 255 / .1); font-weight: bold";

	public static log(
		_class: any,
		callerFunction: (...a: any[]) => any | null,
		...args: any[]
	): void {
		console.log(
			`%c[%c${_class.name}%c] (%c${callerFunction?.name ?? ""}%c) >`,
			"color: inherit; margin: 5px 0",
			`color: ${this.getHslFromString(_class.name)}; ${this.boldEffect}`,
			"color: inherit",
			`color: ${
				callerFunction?.name != null
					? this.getHslFromString(callerFunction.name)
					: "inherit"
			}; ${this.boldEffect}`,
			"color: inherit",
			...args
		);
	}

	private static getHslFromString(str: string): string {
		return `hsl(${this.getHueFromString(str)}, 100%, 70%)`;
	}

	// https://gist.github.com/0x263b/2bdd90886c2036a1ad5bcf06d6e6fb37
	private static getHueFromString(str: string): number {
		let hash = 0;
		if (str.length === 0) return hash;

		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash |= 0; // Convert to 32bit integer
		}

		const result = hash % 360;
		if (result < 0) return result + 360;
		else return result;
	}
}

class LogExtend {
	protected static log(
		callerFunction: (...a: any[]) => any | null,
		...args: any[]
	): void {
		Logger.log(this, callerFunction, ...args);
	}
}
