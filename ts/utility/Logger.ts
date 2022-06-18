class Logger {
	private static boldEffect: string = "font-weight: bold";
	private static shadowEffect: string =
		"text-shadow: 0 .5px 3px rgb(255 255 255 / .1)";

	public static log(
		callerClass: any,
		callerFunction: (...a: any[]) => any,
		message: string,
		...args: any[]
	): void {
		if (SoundboardApi.isProduction) return;

		this.logInfo(callerClass, callerFunction, message, ...args);
	}

	public static error(
		callerClass: any,
		callerFunction: (...a: any[]) => any,
		message: string,
		...args: any[]
	): void {
		if (SoundboardApi.isProduction) return;

		this.logError(callerClass, callerFunction, message, ...args);
	}

	private static logInfo(
		callerClass: any,
		callerFunction: (...a: any[]) => any,
		message: string,
		...args: any[]
	): void {
		let attributes = this.getExtraAttributes(
			callerClass,
			callerFunction,
			message
		);

		console.info(attributes[0], ...attributes[1], ...args);
	}

	private static logError(
		callerClass: any,
		callerFunction: (...a: any[]) => any,
		message: string,
		...args: any[]
	): void {
		let attributes = this.getExtraAttributes(
			callerClass,
			callerFunction,
			message
		);

		console.error(attributes[0], ...attributes[1], ...args);
	}

	private static getExtraAttributes(
		callerClass: any,
		callerFunction: (...a: any[]) => any,
		message: string
	): [string, string[]] {
		let callerClassName = "-";
		let callerClassProperties: string[] = [];
		if (callerClass?.name != null) {
			callerClassName = `%c${callerClass.name}`;
			callerClassProperties.push(
				`color: ${this.getHslFromString(callerClass.name)};
				${this.boldEffect};
				${this.shadowEffect}`
			);
		}

		let callerFunctionName = "-";
		let callerFunctionProperties: string[] = [];
		if (callerFunction?.name != null) {
			callerFunctionName = `%c${callerFunction.name}`;
			callerFunctionProperties.push(
				`color: ${this.getHslFromString(callerFunction.name)};
				${this.boldEffect};
				${this.shadowEffect}`
			);
		}

		return [
			`%c[${callerClassName}%c] (${callerFunctionName}%c) → ` + message,
			[
				"color: inherit; margin: 5px 0",
				...callerClassProperties,
				"color: inherit",
				...callerFunctionProperties,
				"color: inherit",
			],
		];
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
		message: string,
		...args: any[]
	): void {
		Logger.log(this, callerFunction, message, ...args);
	}

	protected static error(
		callerFunction: (...a: any[]) => any | null,
		message: string,
		...args: any[]
	): void {
		Logger.error(this, callerFunction, message, ...args);
	}
}
