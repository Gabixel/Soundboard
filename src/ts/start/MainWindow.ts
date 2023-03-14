abstract class MainWindow extends Main {
	public static async initWindow() {
		super.init();

		// Reference grid
		Grid.initGrid($("#buttons-grid"));

		// Grid resizer
		GridResizer.initialize($("#grid-rows"), $("#grid-columns"), $("#clear-grid"));

		// Button swap
		ButtonSwap.initialize();

		// Audio output
		await AudioPlayer.initializeAudioDevices();

		// TODO: Extract audio from video file? (probably not necessary)
		// https://stackoverflow.com/questions/49140159/extracting-audio-from-a-video-file

		// Initialize volume in the audio player and the play/stop buttons
		AudioPlayer.initVolumeSliders(
			$("#volume-slider-primary"),
			$("#volume-slider-secondary")
		).setAudioButtons($("#play-toggle-audio-button"), $("#stop-audio-button"));

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

		// Show window content
		$(document.body).find("#soundboard").attr("style", "opacity: 1");
	}
}

// On page load
$(() => {
	MainWindow.initWindow();
});
