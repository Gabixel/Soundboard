abstract class Logger {
	private static chosenStyle: number = 1;

	/** Debug-level logging (aka "Verbose") */
	public static logDebug(
		callerFunction: AnyFunc<any> | string,
		message: string,
		...args: any[]
	): void {
		if (SoundboardApi.isProduction) {
			return;
		}

		const callerClass = this.name;
		let attributes: [string, string[]];

		if (typeof callerFunction === "string") {
			attributes = this.getStyledAttributes(callerClass, callerFunction, message);
		} else {
			attributes = this.getStyledAttributes(
				callerClass,
				callerFunction?.name,
				message
			);
		}

		console.debug(attributes[0], ...attributes[1], ...args);
	}

	/** Info-level logging */
	public static logInfo(
		callerFunction: AnyFunc<any> | string,
		message: string,
		...args: any[]
	): void {
		if (SoundboardApi.isProduction) {
			return;
		}

		const callerClass = this?.name;
		let attributes: [string, string[]];

		if (typeof callerFunction === "string") {
			attributes = this.getStyledAttributes(callerClass, callerFunction, message);
		} else {
			attributes = this.getStyledAttributes(
				callerClass,
				callerFunction?.name,
				message
			);
		}

		console.info(attributes[0], ...attributes[1], ...args);
	}

	/** Error-level logging */
	public static logError(
		callerFunction: AnyFunc<any> | string,
		message: string,
		...args: any[]
	): void {
		if (SoundboardApi.isProduction) {
			return;
		}

		const callerClass = this.name;
		let attributes: [string, string[]];

		if (typeof callerFunction === "string") {
			attributes = this.getStyledAttributes(callerClass, callerFunction, message);
		} else {
			attributes = this.getStyledAttributes(
				callerClass,
				callerFunction?.name,
				message
			);
		}

		console.error(attributes[0], ...attributes[1], ...args);
	}

	private static getStyledAttributes(
		callerClass: string,
		callerFunction: string,
		message: string
	): [string, string[]] {
		switch (this.chosenStyle) {
			case 0:
				return this.getStyle_0(callerClass, callerFunction, message);

			case 1:
			default:
				return this.getStyle_1(callerClass, callerFunction, message);
		}
	}

	private static getStyle_0(
		callerClass: string,
		callerFunction: string,
		message: string
	): [string, string[]] {
		const shadowEffect: string = "text-shadow: 0 .5px 3px rgb(255 255 255 / .1)";

		const boldEffect: string = "font-weight: bold";

		let callerClassRendered = "-";
		let callerClassProperties: string[] = [];

		// Not empty/null string
		if (callerClass) {
			callerClassRendered = `%c${callerClass}`;
			callerClassProperties.push(
				`color: ${StringUtilities.getHsl(callerClass, 70)};
				${boldEffect};
				${shadowEffect}`
			);
		}

		let callerFunctionRendered = "-";
		let callerFunctionProperties: string[] = [];

		// Not empty/null string
		if (callerFunction) {
			callerFunctionRendered = `%c${callerFunction}`;
			callerFunctionProperties.push(
				`color: ${StringUtilities.getHsl(callerFunction, 70)};
				${boldEffect};
				${shadowEffect}`
			);
		}

		return [
			`%c[${callerClassRendered}%c] (${callerFunctionRendered}%c) → ` + message,
			[
				"color: inherit; margin: 5px 0",
				...callerClassProperties,
				"color: inherit",
				...callerFunctionProperties,
				"color: inherit",
			],
		];
	}

	private static getStyle_1(
		callerClass: any,
		callerFunction: string,
		message: string
	): [string, string[]] {
		const colorName = callerFunction ?? callerClass ?? "???";
		const bgColor = StringUtilities.getHsl(colorName, 20);
		const fgColor = StringUtilities.getHsl(colorName, 90);
		const headerStartEffect: string = `background-color: ${bgColor}; color: ${fgColor}; border-radius: 15px 0 0 15px; padding: 2px 0 2px 2px; margin: 5px 0; border-width: 2px 0 2px 2px; border-style: solid; border-color: ${fgColor}; font-weight: bold`;
		const headerMiddleEffect: string = `background-color: ${bgColor}; color: ${fgColor}; border-radius: 0; padding: 2px 0; margin-left: -0.4px; border-width: 2px 0; border-style: solid; border-color: ${fgColor}; font-weight: bold`;
		const headerEndEffect: string = `background-color: ${bgColor}; color: ${fgColor}; border-radius: 0 15px 15px 0; padding: 2px 2px 2px 0; margin-left: -0.4px; border-width: 2px 2px 2px 0; border-style: solid; border-color: ${fgColor}; font-weight: bold`;

		let callerClassRendered = "%c...";
		let callerClassProperties: string[] = [headerMiddleEffect];

		// Not empty/null string
		if (callerClass) {
			callerClassRendered = `%c${callerClass}`;
		}

		let callerFunctionRendered = "";
		let callerFunctionProperties: string[] = [];

		// Not empty/null string
		if (callerFunction) {
			callerFunctionRendered = `%c ⨠ %c${callerFunction}`;
			callerFunctionProperties = [headerMiddleEffect, headerMiddleEffect];
		}

		return [
			`%c ${callerClassRendered}${callerFunctionRendered}%c %c ` + message,
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
