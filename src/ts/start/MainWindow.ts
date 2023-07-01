abstract class MainWindow extends Main {
	// Grid & Buttons
	private static _gridManager: GridManager;
	private static _soundButtonManager: SoundButtonManager;
	private static _buttonFilterer: ButtonFilterer;
	private static _gridResizer: GridResizer;
	private static _buttonSwap: ButtonSwap;

	// Audio
	private static _audioOutput: AudioOutput;
	private static _audioPlayer: AudioPlayer;

	public static async initWindow() {
		await super.init();

		this.setupGrid();

		this.setupAudio();

		// Initialize volume in the audio player and the play/stop buttons
		// AudioPlayer.initVolumeSliders(
		// 	$("#volume-slider-primary"),
		// 	$("#volume-slider-secondary")
		// ).setAudioButtons($("#play-toggle-audio-button"), $("#stop-audio-button"));

		// Set UI scale controls
		UiScale.setControls(
			$("#ui-scale-slider"),
			$("#ui-scale-lock"),
			$("#ui-scale-reset")
		);

		// Setup context menu
		// TODO: class?
		$(document).on("contextmenu", () => {
			SoundboardApi.mainWindow.openContextMenu();
		});

		$(window).on("dragover", (e) => {
			e.preventDefault();
			e.originalEvent.dataTransfer.dropEffect = "none";
			return false;
		});

		SoundboardApi.mainWindow.onButtonDataUpdate((id, buttonData) => {
			SoundButtonManager.updateButton(id, buttonData);
		});
	}

	// TODO: include with future loader event
	public static showWindowContent(): void {
		$(document.body).find("#soundboard").attr("style", "opacity: 1");
	}

	private static async setupGrid(): Promise<void> {
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
	}

	private static setupAudio(): void {
		let output = (this._audioOutput = new AudioOutput());
	}
}

// On page load
$(() => {
	MainWindow.initWindow().then(MainWindow.showWindowContent);
});
