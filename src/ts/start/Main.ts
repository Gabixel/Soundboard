abstract class Main extends Logger {
	// TODO: create a specific object to store intervals(?)
	private static _intervals: NodeJS.Timer[] = [];

	public static addInterval(interval: NodeJS.Timer): void {
		this._intervals.push(interval);
	}

	// TODO: add a loader and pass the window container to it to integrate the fade-in animation with the loader stop event

	protected static async init(): Promise<void> {
		// Uncaught exceptions handling
		this.initUncaughtExceptionsHandler();

		await SoundboardApi.global.path.initRoot();

		// Some info for debug
		this.logInfo(
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

		// Fix JQuery passive events (?)
		// TODO: improve / check what it actually does
		JQueryFixes.fixPassiveEvents();
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

			this.logError(
				null,
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
		window.onunhandledrejection = (event) => {
			// Don't print default error
			event.preventDefault();

			this.logError(
				null,
				"An unexpected (in promise) error has occurred.\n",
				`'${event.reason}'\n`,
				event
			);
		};

		function validExtension(source: string): boolean {
			return ["js", "ts"].some((extension) => source.endsWith("." + extension));
		}
	}
}