class Logger {
	private static boldEffect: string = "font-weight: bold";
	private static shadowEffect: string =
		"text-shadow: 0 .5px 3px rgb(255 255 255 / .1)";

	public static log(
		_class: any,
		callerFunction: (...a: any[]) => any,
		...args: any[]
	): void {
		console.info(
			`%c[%c${_class?.name ?? ""}%c] (%c${callerFunction?.name ?? ""}%c) >`,
			`color: inherit; margin: 5px 0`,
			`color: ${this.getHslFromString(_class?.name ?? "43")};
				${this.boldEffect};
				${this.shadowEffect}`,
			`color: inherit`,
			`color: ${this.getHslFromString(callerFunction?.name ?? "43")};
				${this.boldEffect}`,
			`color: inherit`,
			...args
		);
	}

	private static getHslFromString(str: string): string {
		return `hsl(${this.getHueFromString(str)}, 100%, 70%)`;
	}

	private static getHueFromString(str: string): number {
		let hash = 0;
		if (str.length === 0) return hash;

		hash = this.getHashFromString(str);

		const result = hash % 360;
		if (result < 0) return result + 360;
		else return result;
	}

	private static getHashFromString(str: string): number {
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

class LogExtend {
	protected static log(
		callerFunction: (...a: any[]) => any | null,
		...args: any[]
	): void {
		Logger.log(this, callerFunction, ...args);
	}
}
