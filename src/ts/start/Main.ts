abstract class Main {
	// TODO: create a specific object to store intervals(?)
	private static _intervals: NodeJS.Timer[] = [];
	public static addInterval(interval: NodeJS.Timer): void {
		this._intervals.push(interval);
	}

	// TODO: add a loader and pass the window container to it to integrate the fade-in animation with the loader stop event

	protected static async init(): Promise<void> {
		let appPathRequest: Promise<void> = null;

		if (this.classExists(typeof SoundboardApi)) {
			appPathRequest = SoundboardApi.global.path.retrieveAppPath();
		} else {
			throw new TypeError("SoundboardApi is not available");
		}

		if (this.classExists(typeof StringUtilities)) {
			StringUtilities.setupStringPrototypeExtensions();
		} else {
			throw new TypeError("StringUtilities is not available");
		}

		if (this.classExists(typeof Logger)) {
			// Some info for debug
			Logger.logInfo(
				"\nUserAgent:",
				navigator.userAgent,
				"\nMain language:",
				navigator.language,
				"\nLanguages:",
				navigator.languages,
				"\nCookie enabled?",
				navigator.cookieEnabled,
				"\nNavigator:",
				navigator
			);

			// Uncaught exceptions handling
			this.initUncaughtExceptionsHandler();
		} else {
			throw new TypeError("Logger is not available");
		}

		if (this.classExists(typeof JQueryFixes)) {
			// Fix JQuery passive events (?)
			// TODO: improve / check what it actually does
			JQueryFixes.fixPassiveEvents();
		} else {
			throw new TypeError("JQueryFixes is not available");
		}

		if (appPathRequest) {
			await appPathRequest;
		}
	}

	protected static clearIntervals() {
		this._intervals.forEach((interval) => clearInterval(interval));
	}

	private static initUncaughtExceptionsHandler() {
		// See https://developer.mozilla.org/en-US/docs/Web/API/Window/error_event
		window.onerror = (
			event: Event | string,
			source?: string,
			lineNo?: number,
			colNo?: number,
			error?: Error
		): void => {
			if (!validExtension(source)) {
				return;
			}

			this.clearIntervals();

			Logger.logError(
				"An unexpected error has occurred.\n",
				event,
				"\n",
				`Source: ${source}\n`,
				`At line ${lineNo}, column ${colNo}\n`,
				`Type: ${error.name}\n`,
				`Message: "${error.message}"`
			);
		};

		// See https://developer.mozilla.org/en-US/docs/Web/API/Window/unhandledrejection_event
		window.onunhandledrejection = (e) => {
			// Don't print default error
			e.preventDefault();

			Logger.logError(
				"An unexpected (in promise) error has occurred.\n",
				`'${e.reason}'\n`,
				e
			);
		};

		Logger.logDebug("Exception handler is running...");

		function validExtension(source: string): boolean {
			return ["js", "ts"].some((extension) => source.endsWith("." + extension));
		}
	}

	private static classExists(type: string): boolean {
		return type === "function";
	}
}
