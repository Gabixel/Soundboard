abstract class Main extends Logger {
	public static async initMainWindow() {
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

		JQueryFixes.fixPassiveEvents();

		// Reference grid
		Grid.initGrid($("#buttons-grid"));

		// Grid resizer
		initResizer(); // TODO: move to class

		// Button swap
		ButtonSwap.initialize();

		// Audio output
		await AudioPlayer.updateAudioDevicesList();

		// TODO: Extract audio from video file? (probably not necessary)
		// https://stackoverflow.com/questions/49140159/extracting-audio-from-a-video-file

		// Initialize volume in the audio player
		AudioPlayer.setVolumeSlider($("#volume-slider"));

		// Initialize sound button generator
		SoundButton.initialize(Grid.$grid);

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
}

// On page load
$(() => {
	Main.initMainWindow();
});
