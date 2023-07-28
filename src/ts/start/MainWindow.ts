abstract class MainWindow extends Main {
	// Grid & Buttons
	private static _gridManager: GridManager;
	private static _soundButtonManager: SoundButtonManager;
	private static _buttonFilterer: ButtonFilterer;
	private static _gridResizer: GridResizer;
	private static _gridNavigation: GridNavigation;
	private static _buttonSwap: ButtonSwap;
	private static _soundButtonDataCollection: SoundButtonDataCollection;

	// Audio
	private static _audioPlayer: AudioPlayer;
	private static _audioDeviceSelect: AudioDeviceSelect;

	public static async initWindow() {
		await super.init();

		await this.setupGrid();

		this.setupAudio();

		this.setupCollections();

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

		// Arrow key movement
		this._gridNavigation = new GridNavigation(this._gridManager);

		// Button swap
		this._buttonSwap = new ButtonSwap(this._gridManager);
	}

	private static setupCollections(): void {
		this._soundButtonDataCollection = new SoundButtonDataCollection(
			$("#buttons-collections-controls")
		);
	}

	/**
	 * Initializes audio logic.
	 *
	 * It's a bit complex, so here's a quick summary of how audio components work (in order of appearance and complexity):
	 * 1. **{@link AudioSource}**: The basic one. It's a wrapper for an {@link HTMLAudioElement} with the purpose of **connecting it to an {@link AudioContext} instance**, with the ability to add or remove filters (aka effects). // TODO: effects
	 * 2. **{@link AudioCouple}**: Contains two {@link AudioSource} instances, one for **primary and**, the other, **for secondary output**, so that both you and your friends can hear the audio.
	 * 3. (**{@link IAudioControls}**: Basic controls for the two previous classes.)
	 * 4. **{@link AudioOutput}**: Audio output controller. It uses an {@link AudioContext} instance. In this soundboard logic, there should be one instance for primary output, and another for playback.
	 * 5. **{@link AudioStore}**: Audio storage. It can be configured to hold any number of {@link AudioCouple} instances. This can be used to have a store only 1 main audio couple, and another for a collection of them. It should be used in the following class.
	 * 6. **{@link AudioPlayer}**: The biggest one. The wrapper for all of the above, containing the two {@link AudioStore} instances mentioned earlier, and two {@link AudioOutput}s. This is the class that {@link SoundButtonManager} calls when a button gets clicked.
	 */
	private static setupAudio(): void {
		this._audioPlayer = new AudioPlayer()
			.setControls(
				$("#play-toggle-audio-button"),
				$("#stop-audio-button"),
				$("#audio-loop-single")
			)
			.bindStateChange()
			.setupVolumeSlider($("#volume-slider"), {
				decimals: 4,
				exponentialBase: 100,
			});

		this._audioDeviceSelect = new AudioDeviceSelect(
			$("#audio-output-select"),
			this._audioPlayer
		);

		this._soundButtonManager.setupAudioPlayer(this._audioPlayer);
	}
}

// On page load
$(() => {
	MainWindow.initWindow().then(MainWindow.showWindowContent);
});
