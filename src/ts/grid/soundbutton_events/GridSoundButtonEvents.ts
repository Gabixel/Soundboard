class GridSoundButtonEvents<TAudioPlayer extends IAudioPlayer = IAudioPlayer> {
	private _audioPlayer: TAudioPlayer;
	private _soundButtonFactory: SoundButtonFactory;
	private _gridSoundButtonChildFactory: GridSoundButtonChildFactory;

	private _gridSoundButtonSwap: GridSoundButtonSwap;
	private _gridSoundButtonEdit: GridSoundButtonEdit;

	constructor(
		audioPlayer: TAudioPlayer,
		soundButtonFactory: SoundButtonFactory,
		gridSoundButtonChildFactory: GridSoundButtonChildFactory
	) {
		this._audioPlayer = audioPlayer;
		this._soundButtonFactory = soundButtonFactory;
		this._gridSoundButtonChildFactory = gridSoundButtonChildFactory;
	}

	public addEvents($gridsContainer: JQuery<HTMLElement>): void {
		this.addClickEvent($gridsContainer);
		this.addContextMenuEvent($gridsContainer);
		this.addSwap($gridsContainer);
		this.addDragAndDropEvent($gridsContainer);
	}

	public cancelSwap(): void {
		this._gridSoundButtonSwap.cancelSwap();
	}

	private addClickEvent($gridsContainer: JQuery<HTMLElement>) {
		$gridsContainer.on(
			"click",
			`.${SoundButtonDispatcher.SOUNDBUTTON_CLASS}`,
			(e) => {
				// TODO: rate-limit while holding the button with a "send" key (i.e. Enter)
				Logger.logDebug(
					`Button "%s" clicked`,
					$(e.target).children(".button-theme").text()
				);

				const { path, volume, time } =
					this._soundButtonFactory.getButtonDataByParsedId($(e.target).attr("id"));

				const options: AudioSourceOptions = {
					src: path,
					volume,
					audioTimings: time,
				};

				const useSecondaryStorage = e.shiftKey;

				this._audioPlayer.play(options, useSecondaryStorage);
			}
		);
	}

	private addContextMenuEvent($gridsContainer: JQuery<HTMLElement>) {
		this._gridSoundButtonEdit = new GridSoundButtonEdit(
			this._gridSoundButtonChildFactory,
			$gridsContainer
		).handleEditEvent();

		$gridsContainer.on(
			"contextmenu",
			`.${SoundButtonDispatcher.SOUNDBUTTON_CLASS}`,
			(e) => {
				e.stopPropagation(); // To prevent the document's trigger

				let $target = $(e.target);
				let buttonData = this._soundButtonFactory.getButtonDataByElement($target);

				let args: ContextMenuArgs = {
					type: "soundbutton",
					parsedId: $(e.target).attr("id"),
					buttonData,
				};

				SoundboardApi.mainWindow.openContextMenu(args);
			}
		);
	}

	private addSwap($gridsContainer: JQuery<HTMLElement>) {
		this._gridSoundButtonSwap = new GridSoundButtonSwap(
			this._gridSoundButtonChildFactory,
			$gridsContainer
		);
	}

	private addDragAndDropEvent($gridsContainer: JQuery<HTMLElement>) {
		$gridsContainer.on(
			"dragenter",
			`.${SoundButtonDispatcher.SOUNDBUTTON_CLASS}`,
			(e) => {
				Logger.logDebug("'dragenter' triggered");

				e.preventDefault();
				e.stopPropagation();
				e.originalEvent.dataTransfer.dropEffect = "link";

				getTarget(e).addClass("file-dragover");
			}
		);

		function getTarget(e: JQuery.DragEventBase): SoundButtonElementJQuery {
			return $(e.target);
		}
	}
}
