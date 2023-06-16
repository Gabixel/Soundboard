abstract class MainWindow extends Main {
	private static _gridManager: GridManager;
	private static _soundButtonManager: SoundButtonManager;
	private static _gridResizer: GridResizer;
	private static _buttonSwap: ButtonSwap;
	private static _buttonFilterer: ButtonFilterer;

	public static async initWindow() {
		await super.init();

		// Grid manager
		this._gridManager = new GridManager($("#buttons-grid"));

		// Soundbutton manager
		this._soundButtonManager = new SoundButtonManager(this._gridManager.$grid)
			.setupClick()
			.setupContextMenu();

		// Button filterer
		this._buttonFilterer = new ButtonFilterer(this._gridManager).setupInputs(
			$("#filter-buttons-input"),
			$("#clear-filter-button")
		);

		// Grid resize manager
		this._gridResizer = await new GridResizer(
			this._gridManager,
			this._soundButtonManager,
			this._buttonFilterer
		).setInputs($("#grid-rows"), $("#grid-columns"), $("#clear-grid"));

		// Button swap
		this._buttonSwap = new ButtonSwap(this._gridManager);

		// Audio output
		await AudioPlayer.initializeAudioDevices();

		// TODO: Extract audio from video file? (probably not necessary)
		// https://stackoverflow.com/questions/49140159/extracting-audio-from-a-video-file

		// Initialize volume in the audio player and the play/stop buttons
		AudioPlayer.initVolumeSliders(
			$("#volume-slider-primary"),
			$("#volume-slider-secondary")
		).setAudioButtons($("#play-toggle-audio-button"), $("#stop-audio-button"));

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
	}

	// TODO: include with future loader event
	public static showWindowContent(): void {
		$(document.body).find("#soundboard").attr("style", "opacity: 1");
	}
}

// On page load
$(() => {
	MainWindow.initWindow().then(MainWindow.showWindowContent);
});
