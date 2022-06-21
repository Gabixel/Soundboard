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

class Logger {
	private static chosenStyle: number = 0;

	//#region Effects
	private static boldEffect: string = "font-weight: bold";

	private static shadowEffect: string =
		"text-shadow: 0 .5px 3px rgb(255 255 255 / .1)";

	private static headerStartEffect: string =
		"background-color: #fff; color: #000; border-radius: 15px 0 0 15px; padding: 2px 0 2px 2px; margin: 5px 0";
	private static headerMiddleEffect: string =
		"background-color: #fff; color: #000; border-radius: 0; padding: 2px 0; margin-left: -0.2px";
	private static headerEndEffect: string =
		"background-color: #fff; color: #000; border-radius: 0 15px 15px 0; padding: 2px 2px 2px 0; margin-left: -0.2px";
	//#endregion

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
		let attributes = this.getStyledAttributes(
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
		let attributes = this.getStyledAttributes(
			callerClass,
			callerFunction,
			message
		);

		console.error(attributes[0], ...attributes[1], ...args);
	}

	private static getHslFromString(str: string, lightness: number): string {
		return `hsl(${this.getHueFromString(str)}, 100%, ${lightness}%)`;
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

	private static getStyledAttributes(
		callerClass: any,
		callerFunction: (...a: any[]) => any,
		message: string
	): [string, string[]] {
		switch (this.chosenStyle) {
			case 0:
				return this.style0(callerClass, callerFunction, message);

			default:
				return this.style1(callerClass, callerFunction, message);
		}
	}

	private static style0(
		callerClass: any,
		callerFunction: (...a: any[]) => any,
		message: string
	): [string, string[]] {
		let callerClassName = "-";
		let callerClassProperties: string[] = [];
		if (callerClass?.name != null) {
			callerClassName = `%c${callerClass.name}`;
			callerClassProperties.push(
				`color: ${this.getHslFromString(callerClass.name, 70)};
				${this.boldEffect};
				${this.shadowEffect}`
			);
		}

		let callerFunctionName = "-";
		let callerFunctionProperties: string[] = [];
		if (callerFunction?.name != null) {
			callerFunctionName = `%c${callerFunction.name}`;
			callerFunctionProperties.push(
				`color: ${this.getHslFromString(callerFunction.name, 70)};
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

	private static style1(
		callerClass: any,
		callerFunction: (...a: any[]) => any,
		message: string
	): [string, string[]] {
		let callerClassName = "-";
		let callerClassProperties: string[] = [];
		if (callerClass?.name != null) {
			callerClassName = `%c${callerClass.name}`;
			callerClassProperties.push(
				`${this.headerMiddleEffect};
				color: ${this.getHslFromString(callerClass.name, 30)};
				${this.boldEffect};`
			);
		}

		let callerFunctionName = "-";
		let callerFunctionProperties: string[] = [];
		if (callerFunction?.name != null) {
			callerFunctionName = `%c${callerFunction.name}`;
			callerFunctionProperties.push(
				` ${this.headerMiddleEffect};
				color: ${this.getHslFromString(callerFunction.name, 30)};
				${this.boldEffect};`
			);
		}

		return [
			`%c ${callerClassName}%c.${callerFunctionName}%c %c ` + message,
			[
				this.headerStartEffect,
				...callerClassProperties,
				this.headerMiddleEffect,
				...callerFunctionProperties,
				this.headerEndEffect,
				"color: inherit",
			],
		];
	}
}
