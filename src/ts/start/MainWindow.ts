abstract class MainWindow extends Main {
	// Grid
	private static _gridDispatcher: GridDispatcher;

	// Sound Buttons
	private static _soundButtonFactory: SoundButtonFactory;
	private static _gridSoundButtonEvents: GridSoundButtonEvents;
	private static _soundButtonDispatcher: SoundButtonDispatcher;
	private static _soundButtonSanitizer: SoundButtonSanitizer;

	// Grid
	private static _gridResizer: GridResizer;
	private static _gridSoundButtonIdGenerator: GridSoundButtonIdGenerator;
	private static _gridSoundButtonChildFactory: GridSoundButtonChildFactory;

	// Collection and grid tabs
	public static _soundButtonCollectionStore: SoundButtonCollectionStore;
	private static _collectionTabs: CollectionTabs;

	// Audio
	private static _audioPlayer: AudioPlayer;
	private static _audioDeviceSelect: AudioDeviceSelect;

	private static DEFAULT_BUTTONDATA: Readonly<SoundButtonDataNoId> = {
		isEdited: false,
		title: "-",
		color: { h: 0, s: 0, l: 80 },
		image: null,
		tags: [],
		time: {
			start: 0,
			end: 0,
			condition: "after",
		},
		volume: 1,
		path: null,
	};

	public static async initWindow() {
		await super.init();

		this.setupAudio();

		this._soundButtonCollectionStore = new SoundButtonCollectionStore();

		this._gridSoundButtonIdGenerator = new GridSoundButtonIdGenerator(
			this._soundButtonCollectionStore
		);

		this._soundButtonSanitizer = new SoundButtonSanitizer(
			MainWindow.DEFAULT_BUTTONDATA
		);

		let collectionCache = new SoundButtonCollectionCache(
			this._soundButtonCollectionStore
		).loadCache();

		this._soundButtonFactory = new SoundButtonFactory(
			this._gridSoundButtonIdGenerator,
			this._soundButtonCollectionStore,
			this._soundButtonSanitizer
		);
		this._soundButtonDispatcher = new SoundButtonDispatcher(
			this._soundButtonFactory
		);

		// FIXME: import/export collections
		/*this._soundButtonCollectionStore.addExistingCollections([
			{
				id: 0,
				name: "cool name",
				isCached: true,
				buttonData: [
					{
						index: 0,
						isEdited: true,
						title: "test",
						volume: 1,
						color: { h: 0, s: 0, l: 80 },
						path: await this._soundButtonFactory.getRandomAudioPath(),
					},
					{
						index: 1,
						isEdited: true,
						title: "sium",
						volume: 1,
						color: { h: 0, s: 0, l: 80 },
						path: await this._soundButtonFactory.getRandomAudioPath(),
					},
				],
				focused: true,
			},
			{
				id: 1,
				name: "another cool name",
				isCached: true,
				buttonData: [],
				focused: false,
			},
		]);*/

		this._gridResizer = new GridResizer($("#grid-rows"), $("#grid-columns"));

		this._gridSoundButtonChildFactory = new GridSoundButtonChildFactory(
			this._soundButtonDispatcher,
			this._soundButtonCollectionStore
		);

		this._gridDispatcher = new GridDispatcher(
			this._gridResizer,
			this._gridSoundButtonChildFactory,
			this._gridSoundButtonIdGenerator,
			new GridSoundButtonEvents(
				this._audioPlayer,
				this._soundButtonFactory,
				this._gridSoundButtonChildFactory
			),
			this._soundButtonCollectionStore,
			$("#buttons-grids") as GridElementJQuery
		);

		Promise.all([collectionCache]).then(() => {
			console.log("Cache finished loading");
			console.log(this._soundButtonCollectionStore.getAllCollections());
			this._collectionTabs = new CollectionTabs(
				this._soundButtonCollectionStore,
				this._gridDispatcher,
				$("#buttons-collections-controls")
			);
		});

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

		// Drag over visual issue prevention(?)
		// TODO: can probably be removed, doesn't seem to fix anything
		$(window).on("dragover", (e) => {
			e.preventDefault();
			e.originalEvent.dataTransfer.dropEffect = "none";
			return false;
		});

		// TODO: move somewhere else
		// SoundboardApi.mainWindow.onButtonDataUpdate((id, buttonData) => {
		// 	SoundButtonManager.updateButton(id, buttonData);
		// });
	}

	// TODO: include with future loader event
	public static showWindowContent(): void {
		$(document.body).find("#soundboard").attr("style", "opacity: 1");
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
	 * 6. **{@link AudioPlayer}**: The biggest one. The wrapper for all of the above, containing the two {@link AudioStore} instances mentioned earlier, and two {@link AudioOutput}s. This is the class that {@link SoundButtonDispatcher} calls when a button gets clicked.
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
	}
}

// On page load
$(() => {
	MainWindow.initWindow().then(MainWindow.showWindowContent);
});
