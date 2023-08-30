abstract class MainWindow extends Main {
	// Grid
	private static _gridDispatcher: GridDispatcher;

	// Sound Buttons
	private static _soundButtonFactory: SoundButtonFactory;
	private static _gridSoundButtonEvents: GridEvents;
	private static _soundButtonDispatcher: SoundButtonDispatcher;
	private static _soundButtonSanitizer: SoundButtonSanitizer;

	// Grid
	private static _gridResizer: GridResizer;
	private static _gridSoundButtonIdGenerator: GridSoundButtonIdGenerator;
	private static _gridSoundButtonChildFactory: GridSoundButtonChildFactory;
	private static _gridSoundButtonFilter: GridSoundButtonFilter;

	// Collection and grid tabs
	public static _soundButtonCollectionStore: SoundButtonCollectionStore;
	private static _collectionTabs: CollectionTabDispatcher;

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

		const UI = {
			$gridsContainer: $("#buttons-grids") as GridElementJQuery,
			$collectionTabsControlContainer: $(
				"#buttons-collections-controls"
			) as JQuery<HTMLDivElement>,
		};

		this.setupAudio();

		this._soundButtonCollectionStore = new SoundButtonCollectionStore();

		this._gridSoundButtonIdGenerator = new GridSoundButtonIdGenerator();

		this._gridSoundButtonFilter = new GridSoundButtonFilter(
			$("#filter-buttons-input") as GridFilterInput
		);
		this.setupInitialGridFilterConditions(
			this._gridSoundButtonFilter,
			$("#filter-buttons-conditions")
		);

		this._soundButtonSanitizer = new SoundButtonSanitizer(
			MainWindow.DEFAULT_BUTTONDATA
		);

		let collectionCache = new SoundButtonCollectionCache(
			this._soundButtonCollectionStore
		).loadCache();

		this._soundButtonFactory = new SoundButtonFactory(
			this._gridSoundButtonIdGenerator,
			this._soundButtonCollectionStore
		);
		this._soundButtonDispatcher = new SoundButtonDispatcher(
			this._soundButtonFactory
		);

		this._gridResizer = new GridResizer($("#grid-rows"), $("#grid-columns"));

		this._gridSoundButtonChildFactory = new GridSoundButtonChildFactory(
			this._soundButtonDispatcher,
			this._soundButtonCollectionStore,
			this._soundButtonSanitizer
		);

		this._gridDispatcher = new GridDispatcher(
			this._gridResizer,
			this._gridSoundButtonChildFactory,
			this._gridSoundButtonFilter,
			this._gridSoundButtonIdGenerator,
			new GridEvents(
				this._audioPlayer,
				this._soundButtonFactory,
				this._gridSoundButtonChildFactory,
				this._gridResizer
			),
			this._soundButtonCollectionStore,
			UI.$gridsContainer,
			$("#clear-grid-button")
		);

		Promise.all([collectionCache]).then(() => {
			this._collectionTabs = new CollectionTabDispatcher(
				this._soundButtonCollectionStore,
				this._gridDispatcher,
				UI.$collectionTabsControlContainer
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

		$(document).on("keydown", (e) => {
			if (e.ctrlKey && e.key == "Tab") {
				let ev = "tabchange" + (e.shiftKey ? "prev" : "next");
				return trigger(ev);
			}

			if (e.ctrlKey && e.key == "t") {
				return trigger("tabcreate");
			}

			return true;

			function trigger(eventName: string): false {
				$(document).trigger(eventName);
				return false;
			}
		});
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
	 * 6. **{@link AudioPlayer}**: The biggest one. The wrapper for all of the above, containing the two {@link AudioStore} instances mentioned earlier, and two {@link AudioOutput}s. This is the class that needs to be called to manage audio.
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

	private static setupInitialGridFilterConditions(
		filterer: GridSoundButtonFilter,
		$conditionsContainer: JQuery<HTMLDivElement>
	): void {
		const $getCheckbox = () => {
			return $("<input>", {
				type: "checkbox",
			}).on("change", (e) => {
				let $target = $(e.target);
				const id = e.target.id;

				console.log("triggered change to checkbox");

				filterer.triggerConditionChange(id, $target.is("checked"));
			}) as JQuery<HTMLInputElement>;
		};

		const $getLabel = (forId: string, text: string) => {
			return $("<label>", {
				for: forId,
				text,
			});
		};

		let conditions: GridFilterCondition[] = [
			{
				id: "filter-buttons.text",
				name: "Text",
				isActive: true,
				$input: $getCheckbox(),
				check(): boolean {
					console.log("testing");

					this.$input;
					return true;
				},
				extraConditions: [],
			},
			{
				id: "filter-buttons.index",
				name: "Index",
				isActive: false,
				$input: $getCheckbox(),
				check(): boolean {
					console.log("testing");

					this.$input;
					return true;
				},
				extraConditions: [
					{
						id: "filter-buttons.index.from",
						name: "From",
						$input: $("<select>")
							.append(
								$(`
								<option value="0">0</option>
								<option value="1" selected>1</option>
								`)
							)
							.on("change", (e) => {
								$(e.target).parent().trigger("change");
							}) as JQuery<HTMLInputElement>,
					},
				],
			},
		];

		filterer.addConditions(conditions);

		conditions.forEach((condition) => {
			condition.$input.attr("id", condition.id);

			appendCondition(condition, $conditionsContainer);
		});

		function appendCondition(
			condition: GridFilterCondition,
			$conditionsContainer: JQuery<HTMLDivElement>
		): void {
			let children: JQuery[] = [];

			children.push(condition.$input);

			let finalLabel: JQuery[] = [$getLabel(condition.id, condition.name)];

			if (condition.extraConditions.length > 0) {
				finalLabel.push($getLabel(condition.id, " ( "));

				condition.extraConditions.forEach((subCondition, index) => {
					appendSubCondition(condition, subCondition, finalLabel);

					if (index < 1) {
						return;
					}

					finalLabel.push($getLabel(condition.id, ", "));
				});

				finalLabel.push($getLabel(condition.id, " )"));
			}

			children.push(...finalLabel);

			$conditionsContainer.append($("<div>").append(...children));
		}

		function appendSubCondition(
			mainCondition: GridFilterCondition,
			subCondition: GridFilterSubCondition,
			finalLabel: JQuery[]
		): void {
			finalLabel.push(
				$("<label>", {
					for: mainCondition.$input.attr("id"),
					text: `${subCondition.name}: `,
				})
			);

			finalLabel.push(subCondition.$input);
		}
	}
}

// On page load
$(() => {
	MainWindow.initWindow().then(MainWindow.showWindowContent);
});
