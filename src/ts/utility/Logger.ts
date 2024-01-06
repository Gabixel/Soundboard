abstract class Logger {
	//#region Log functions
	/** Debug-level logging (aka "Verbose"). */
	public static logDebug(message: string, ...args: LoggerAnyExtraArgs[]): void {
		if (SoundboardApi.isProduction) {
			return;
		}

		this.configureAndSendLog(console.debug, message, ...args);
	}

	/** Info-level logging. */
	public static logInfo(message: string, ...args: LoggerAnyExtraArgs[]): void {
		if (SoundboardApi.isProduction) {
			return;
		}

		this.configureAndSendLog(console.info, message, ...args);
	}

	/** Warning-level logging. */
	public static logWarn(message: string, ...args: LoggerAnyExtraArgs[]): void {
		if (SoundboardApi.isProduction) {
			return;
		}

		this.configureAndSendLog(console.warn, message, ...args);
	}

	/** Error-level logging. */
	public static logError(message: string, ...args: LoggerAnyExtraArgs[]): void {
		if (SoundboardApi.isProduction) {
			return;
		}

		this.configureAndSendLog(console.error, message, ...args);
	}
	//#endregion

	private static configureAndSendLog(
		logFunc: (message?: any, ...args: LoggerAnyExtraArgs[]) => void,
		message: string,
		...args: LoggerAnyExtraArgs[]
	): void {
		let { manualCallerClass, manualCallerFunction } = this.getManualCallers(args);

		let info = this.getStyledInfo(
			message,
			manualCallerClass,
			manualCallerFunction
		);

		logFunc(info.text, ...info.style, ...args);
	}

	/**
	 * Extracts the caller class and function from the last argument, if it matches the expected structure.
	 * The expected structure is an object containing at least one of these two property names: "class" and "function".
	 * If the last argument matches this structure, it is removed from the `args` array and its "class" and "function" properties are returned.
	 * If the last argument does not match this structure, undefined values are returned for both the "class" and the "function".
	 *
	 * @param args - The array of arguments from which to extract the caller class and function.
	 * @returns An object with two properties:
	 * - `manualCallerClass` ({@link Class}): The extracted caller class, or undefined if the last argument did not match the expected structure.
	 * - `manualCallerFunction` ({@link AnyFunc}): The extracted caller function, or undefined if the last argument did not match the expected structure.
	 */
	private static getManualCallers(args: LoggerAnyExtraArgs[]): {
		manualCallerClass?: Class;
		manualCallerFunction?: AnyFunc;
	} {
		let manualCallerClass, manualCallerFunction;

		let lastArg = args.slice(-1)?.[0];
		let lastArgKeys = Object.keys(lastArg ?? {});

		// Check for the expected structure
		if (
			lastArg != undefined &&
			typeof lastArg === "object" &&
			lastArgKeys.length > 0 &&
			lastArgKeys.length <= 2 &&
			lastArgKeys.every((key) => key == "class" || key == "function")
		) {
			args.splice(-1);

			manualCallerClass = lastArg.class;
			manualCallerFunction = lastArg.function;
		}

		return {
			manualCallerClass,
			manualCallerFunction,
		};
	}

	private static getStyledInfo(
		message: string,
		manualCallerClass?: Class,
		manualCallerFunction?: AnyFunc
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

				/*if(callerFunction === "<anonymous>") {
					callerFunction = "👻";
				}*/
			}

			// Get only the script file from the file path
			callerFile = filePath.split("/").pop();
		}
		// Use provided caller names
		else {
			callerClass = manualCallerClass?.name ?? "???";
			callerFunction = manualCallerFunction?.name ?? "<anonymous>";
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

	/**
	 * Returns the current date and time in UTC format, as a string.
	 */
	private static getDateTime() {
		const date = new Date();
		const isoString = date.toISOString();
		let displayTime = isoString.slice(0, 10) + " " + isoString.slice(11, 19);
		displayTime = displayTime.replace(/-/g, "/");
		return displayTime;
	}
}
