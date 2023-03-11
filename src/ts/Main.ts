abstract class Main extends Logger {
	public static RESOURCES_PATH: string = "../../../resources/";

	// TODO: create a specific object to store intervals(?)
	private static _intervals: NodeJS.Timer[] = [];

	public static async initMainWindow() {
		// Uncaught exceptions handling
		this.initUncaughtExceptionsHandler();
		
		// Some info for debug
		this.logInfo(
			this.initMainWindow,
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

		// Reference grid
		Grid.initGrid($("#buttons-grid"));

		// Grid resizer
		GridResizer.initialize($("#grid-rows"), $("#grid-columns"), $("#clear-grid"));

		// Button swap
		ButtonSwap.initialize();

		// Audio output
		await AudioPlayer.updateAudioDevicesList();

		// TODO: Extract audio from video file? (probably not necessary)
		// https://stackoverflow.com/questions/49140159/extracting-audio-from-a-video-file

		// Initialize volume in the audio player and the play/stop buttons
		AudioPlayer.setVolumeSlider($("#volume-slider")).setAudioButtons(
			$("#play-toggle-audio-button"),
			$("#stop-audio-button")
		);

		// Initialize sound button generator
		SoundButton.initialize(Grid.$grid);

		ButtonFilter.initialize(
			$("#filter-buttons-input"),
			$("#clear-filter-button")
		);

		// Set UI scale elements
		UiScale.setControls(
			$("#ui-scale-slider"),
			$("#ui-scale-lock"),
			$("#ui-scale-reset")
		);

		// Setup context menu
		// TODO: class?
		$(document).on("contextmenu", () => {
			SoundboardApi.openContextMenu();
		});

		$(window).on("dragover", (e) => {
			e.preventDefault();
			e.originalEvent.dataTransfer.dropEffect = "none";
			return false;
		});

		// Show application
		$(document.body).find("#soundboard").attr("style", "opacity: 1");
	}

	public static addInterval(interval: NodeJS.Timer): void {
		this._intervals.push(interval);
	}

	private static clearIntervals() {
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
			// Operate only on js files
			if (!source.endsWith(".js")) {
				return;
			}
			
			if (typeof AudioPlayer != "undefined") {
				AudioPlayer.stop();
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
	}
}

// On page load
$(() => {
	Main.initMainWindow();
});
