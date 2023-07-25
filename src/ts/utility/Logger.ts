abstract class Logger {
	//#region Log functions
	/** Debug-level logging (aka "Verbose"). */
	public static logDebug(message: string, ...args: any[]): void {
		if (SoundboardApi.isProduction) {
			return;
		}

		this.configureAndSendLog(console.debug, message, ...args);
	}

	/** Info-level logging. */
	public static logInfo(message: string, ...args: any[]): void {
		if (SoundboardApi.isProduction) {
			return;
		}

		this.configureAndSendLog(console.info, message, ...args);
	}

	/** Warning-level logging. */
	public static logWarn(message: string, ...args: any[]): void {
		if (SoundboardApi.isProduction) {
			return;
		}

		this.configureAndSendLog(console.warn, message, ...args);
	}

	/** Error-level logging. */
	public static logError(message: string, ...args: any[]): void {
		if (SoundboardApi.isProduction) {
			return;
		}

		this.configureAndSendLog(console.error, message, ...args);
	}
	//#endregion

	private static configureAndSendLog(
		logFunc: (message?: any, ...optionalParams: any[]) => void,
		message: string,
		...args: (
			| any
			| {
					class: Class;
					function?: AnyFunction;
			  }
		)[]
	): void {
		let manualCallerClass, manualCallerFunction;

		let lastArg = args.slice(-1)?.[0];
		if (
			lastArg != undefined &&
			typeof lastArg === "object" &&
			Object.keys(lastArg).every((key) => key === "class" || key === "function")
		) {
			args.splice(-1);
			manualCallerClass = lastArg.class;
			manualCallerFunction = lastArg.function;
		}

		let info = this.getAndStyleInfo(
			message,
			manualCallerClass,
			manualCallerFunction
		);

		logFunc(info.text, ...info.style, ...args);
	}

	private static getAndStyleInfo(
		message: string,
		manualCallerClass?: Class,
		manualCallerFunction?: AnyFunction
	): LoggerStyleAttributes {
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

		let callerClass, callerFunction, callerFile;

		if (match) {
			const [, caller, filePath] = match;
			const dotIndex = caller.indexOf(".");

			if (dotIndex === -1) {
				// If no dot found, then it's just the caller class (constructor)
				callerClass = caller;
				callerFunction = "[constructor]";
			} else {
				// Split the caller into class and function
				callerClass = caller.slice(0, dotIndex);
				callerFunction = caller.slice(dotIndex + 1);

				// if(callerFunction === "<anonymous>") {
				// 	callerFunction = "👻";
				// }
			}

			// Get only the script file from the file path
			callerFile = filePath.split("/").pop();
		}
		// Use provided caller names
		else {
			callerClass = manualCallerClass?.name ?? "???";
			callerFunction = manualCallerFunction ?? "<anonymous>";
		}

		let styledAttributes = this.getStyledAttributes(
			callerFile,
			callerClass,
			callerFunction,
			message
		);

		return styledAttributes;
	}

	private static getStyledAttributes(
		callerFile: string,
		callerClass: string,
		callerFunction: string,
		message: string
	): LoggerStyleAttributes {
		let textForColor: string = "???";

		// "ClassName"
		if (callerClass) {
			textForColor = callerClass;
		}

		// "ClassName.FunctionName"
		if (callerFunction) {
			textForColor += "." + callerFunction;
		}

		const bgColor = textForColor.getHSL(100, 20);
		const fgColor = textForColor.getHSL(100, 90);
		const headerStartEffect: string = `background-color: ${bgColor}; color: ${fgColor}; border-radius: 15px 0 0 15px; padding: 2px 0 2px 2px; margin: 5px 0; border-width: 2px 0 2px 2px; border-style: solid; border-color: ${fgColor}; font-weight: bold`;
		const headerMiddleEffect: string = `background-color: ${bgColor}; color: ${fgColor}; border-radius: 0; padding: 2px 0; margin-left: -0.4px; border-width: 2px 0; border-style: solid; border-color: ${fgColor}; font-weight: bold`;
		const headerEndEffect: string = `background-color: ${bgColor}; color: ${fgColor}; border-radius: 0 15px 15px 0; padding: 2px 2px 2px 0; margin-left: -0.4px; border-width: 2px 2px 2px 0; border-style: solid; border-color: ${fgColor}; font-weight: bold`;

		// Caller file path style
		let callerFileRendered = "(unknown file)";
		if (callerFile) {
			callerFileRendered = `${callerFile}`;
		}

		// Caller class style
		let callerClassRendered = "...";
		if (callerClass) {
			callerClassRendered = `${callerClass}`;
		}

		// Caller function style
		let callerFunctionRendered = "";
		if (callerFunction) {
			callerFunctionRendered = ` ⨠ ${callerFunction}`;
		}

		// Get UTC version of current timestamp
		let displayTime: string = Logger.getDateTime();

		let text = `%c %c${displayTime}%c %c %c %c${callerFileRendered}%c %c %c %c${callerClassRendered}${callerFunctionRendered}%c %c ${message}`;

		return {
			text,
			style: [
				// Display time
				headerStartEffect,
				headerMiddleEffect,
				headerEndEffect,
				"color: inherit",

				// File path
				headerStartEffect,
				headerMiddleEffect,
				headerEndEffect,
				"color: inherit",

				// Caller function & class
				headerStartEffect,
				headerMiddleEffect,
				headerEndEffect,
				"color: inherit",
			],
		};
	}

	private static getDateTime() {
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

		return displayTime;
	}
}
