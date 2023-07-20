abstract class Logger {
	/** Debug-level logging (aka "Verbose") */
	public static logDebug(message: string, ...args: any[]): void {
		if (SoundboardApi.isProduction) {
			return;
		}

		this.configureAndSendLog(console.debug, message, ...args);
	}

	/** Info-level logging */
	public static logInfo(message: string, ...args: any[]): void {
		if (SoundboardApi.isProduction) {
			return;
		}

		this.configureAndSendLog(console.info, message, ...args);
	}

	/** Warning-level logging */
	public static logWarn(message: string, ...args: any[]): void {
		if (SoundboardApi.isProduction) {
			return;
		}

		this.configureAndSendLog(console.warn, message, ...args);
	}

	/** Error-level logging */
	public static logError(message: string, ...args: any[]): void {
		if (SoundboardApi.isProduction) {
			return;
		}

		this.configureAndSendLog(console.error, message, ...args);
	}

	private static configureAndSendLog(
		logFunc: (message?: any, ...optionalParams: any[]) => void,
		message: string,
		...args: any[]
	): void {
		let info = this.getCallerInfo(message);

		logFunc(
			info.attributes[0],
			...info.attributes[1],
			...args,
			...(info.scriptFileName ? ["\n", info.scriptFileName] : [])
		);
	}

	private static getCallerInfo(message: string): {
		attributes: [string, string[]];
		scriptFileName: string;
	} {
		// Create an Error object to capture the current stack trace
		const err = new Error();

		// Get the stack trace lines
		const stackTrace = err.stack.split("\n");

		// Find the index of the line that doesn't contain the Logger information
		let callerIndex = 0;
		for (let i = 2; i < stackTrace.length; i++) {
			if (!stackTrace[i].includes("Logger")) {
				callerIndex = i;
				break;
			}
		}

		// Get the caller line from the stack trace
		const callerLine = stackTrace[callerIndex].trim();

		// Regular expression to extract the caller class and function
		const regex = /at (?:new )?(?:\S+? )?(\S+?) \((\S+?):\d+:\d+\)/;
		const match = regex.exec(callerLine);

		let callerClass,
			callerFunction,
			scriptFileName = "";

		if (match) {
			const [, caller, filePath] = match;
			const dotIndex = caller.indexOf(".");

			if (dotIndex === -1) {
				// If no dot found, then it's just the caller class (constructor)
				callerClass = caller === "new" ? "" : caller;
				callerFunction = caller === "new" ? "constructor" : "";
			} else {
				// Split the caller into class and function
				callerClass = caller.slice(0, dotIndex);
				callerFunction = caller.slice(dotIndex + 1);
			}

			// Get only the script file from the file path
			scriptFileName = filePath.split("/").pop();
		}

		let attributes: [string, string[]] = this.getStyledAttributes(
			callerClass ?? "",
			callerFunction ?? "",
			message
		);

		return { attributes, scriptFileName };
	}

	private static getStyledAttributes(
		callerClass: string,
		callerFunction: string,
		message: string
	): [string, string[]] {
		return this.getStyle_2(callerClass, callerFunction, message);
	}

	private static getStyle_2(
		callerClass: any,
		callerFunction: string,
		message: string
	): [string, string[]] {
		let textForColor: string = "???";

		// "ClassName"
		if (StringUtilities.isDefined(callerClass)) {
			textForColor = callerClass;
		}

		// "ClassName:FunctionName"
		if (StringUtilities.isDefined(callerFunction)) {
			textForColor += ":" + callerFunction;
		}

		const bgColor = StringUtilities.getHSL(textForColor, 100, 20);
		const fgColor = StringUtilities.getHSL(textForColor, 100, 90);
		const headerStartEffect: string = `background-color: ${bgColor}; color: ${fgColor}; border-radius: 15px 0 0 15px; padding: 2px 0 2px 2px; margin: 5px 0; border-width: 2px 0 2px 2px; border-style: solid; border-color: ${fgColor}; font-weight: bold`;
		const headerMiddleEffect: string = `background-color: ${bgColor}; color: ${fgColor}; border-radius: 0; padding: 2px 0; margin-left: -0.4px; border-width: 2px 0; border-style: solid; border-color: ${fgColor}; font-weight: bold`;
		const headerEndEffect: string = `background-color: ${bgColor}; color: ${fgColor}; border-radius: 0 15px 15px 0; padding: 2px 2px 2px 0; margin-left: -0.4px; border-width: 2px 2px 2px 0; border-style: solid; border-color: ${fgColor}; font-weight: bold`;

		// Caller class style
		let callerClassRendered = "%c...";
		let callerClassProperties: string[] = [headerMiddleEffect];
		if (callerClass) {
			callerClassRendered = `%c${callerClass}`;
		}

		// Caller function style
		let callerFunctionRendered = "";
		let callerFunctionProperties: string[] = [];
		if (callerFunction) {
			callerFunctionRendered = `%c ⨠ %c${callerFunction}`;
			callerFunctionProperties = [headerMiddleEffect, headerMiddleEffect];
		}

		// Get UTC version of current timestamp
		const date = StringUtilities.UTCDate(new Date());

		// Display the time in a better way
		// TODO: improve/compact implementation
		// Year
		let displayTime = date.getFullYear().toString();
		displayTime += "/";
		// Month
		displayTime += date.getMonth().toString().padStart(2, "0");
		displayTime += "/";
		// Day
		displayTime += date.getDay().toString().padStart(2, "0");
		displayTime += " ";
		// Hours
		displayTime += date.getHours().toString().padStart(2, "0");
		// Minutes
		displayTime += ":" + date.getMinutes().toString().padStart(2, "0");
		// Seconds
		displayTime += ":" + date.getSeconds().toString().padStart(2, "0");

		return [
			`%c %c${displayTime}%c %c %c ${callerClassRendered}${callerFunctionRendered}%c %c ${message}`,
			[
				// Display time
				headerStartEffect,
				headerMiddleEffect,
				headerEndEffect,
				"color: inherit",

				// Caller function & class
				headerStartEffect,
				...callerClassProperties,
				...callerFunctionProperties,
				headerEndEffect,
				"color: inherit",
			],
		];
	}
}
