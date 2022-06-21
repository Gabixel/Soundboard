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

	private static boldEffect: string = "font-weight: bold";

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
		const shadowEffect: string = "text-shadow: 0 .5px 3px rgb(255 255 255 / .1)";

		let callerClassName = "-";
		let callerClassProperties: string[] = [];
		if (callerClass?.name != null) {
			callerClassName = `%c${callerClass.name}`;
			callerClassProperties.push(
				`color: ${this.getHslFromString(callerClass.name, 70)};
				${this.boldEffect};
				${shadowEffect}`
			);
		}

		let callerFunctionName = "-";
		let callerFunctionProperties: string[] = [];
		if (callerFunction?.name != null) {
			callerFunctionName = `%c${callerFunction.name}`;
			callerFunctionProperties.push(
				`color: ${this.getHslFromString(callerFunction.name, 70)};
				${this.boldEffect};
				${shadowEffect}`
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
		const bgColor = this.getHslFromString(callerClass.name ?? "???", 20);
		const fgColor = this.getHslFromString(callerClass.name ?? "???", 90);

		const headerStartEffect: string = `background-color: ${bgColor}; color: ${fgColor}; border-radius: 15px 0 0 15px; padding: 2px 0 2px 2px; margin: 5px 0; border-width: 1px 0 1px 1px; border-style: solid; border-color: ${fgColor}`;
		const headerMiddleEffect: string = `background-color: ${bgColor}; color: ${fgColor}; border-radius: 0; padding: 2px 0; margin-left: -0.4px; border-width: 1px 0; border-style: solid; border-color: ${fgColor}`;
		const headerEndEffect: string = `background-color: ${bgColor}; color: ${fgColor}; border-radius: 0 15px 15px 0; padding: 2px 2px 2px 0; margin-left: -0.4px; border-width: 1px 1px 1px 0; border-style: solid; border-color: ${fgColor}`;

		let callerClassName = "%c???";
		let callerClassProperties: string[] = ["color: #fff"];
		if (callerClass?.name != null) {
			callerClassName = `%c${callerClass.name}`;
			callerClassProperties = [
				`${headerMiddleEffect};
				${this.boldEffect};`,
			];
		}

		let callerFunctionName = "";
		let callerFunctionProperties: string[] = [];
		if (callerFunction?.name != null) {
			callerFunctionName = `%c → %c${callerFunction.name}`;
			callerFunctionProperties = [
				headerMiddleEffect,
				`${headerMiddleEffect};
				${this.boldEffect};`,
			];
		}

		return [
			`%c ${callerClassName}${callerFunctionName}%c %c ` + message,
			[
				headerStartEffect,
				...callerClassProperties,
				...callerFunctionProperties,
				headerEndEffect,
				"color: inherit",
			],
		];
	}
}
