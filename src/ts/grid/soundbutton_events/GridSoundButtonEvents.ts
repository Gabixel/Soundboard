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
		$gridsContainer
			.on("dragenter", `.${SoundButtonDispatcher.SOUNDBUTTON_CLASS}`, (e) => {
				e.originalEvent.dataTransfer.dropEffect = "link";

				getTarget(e).addClass("file-dragover");

				e.preventDefault();
			})
			.on("dragover", (e) => {
				e.originalEvent.dataTransfer.dropEffect = "link";

				e.preventDefault();
			})
			.on("drop", `.${SoundButtonDispatcher.SOUNDBUTTON_CLASS}`, (e) => {
				const notSuccesful =
					!e.originalEvent.dataTransfer ||
					!e.originalEvent.dataTransfer.files.length;

				if (notSuccesful) return;

				let $button = getTarget(e);

				$button.trigger("dragleave");

				e.preventDefault();
				e.stopPropagation();

				$button.removeClass("file-dragover");

				const file = e.originalEvent.dataTransfer.files[0];

				const encodedPath = StringUtilities.encodeFilePath(file.path);

				console.log(encodedPath);

				Logger.logDebug(
					"Audio drop successful.\n" +
						"• Files: %O\n" +
						"\t---------\n" +
						"• First file: %O\n" +
						"\t---------\n" +
						"• First file path (encoded for browser): %O",
					e.originalEvent.dataTransfer.files,
					e.originalEvent.dataTransfer.files[0],
					encodedPath
				);

				// TODO: check if file type is supported / allowed.
				// SoundboardApi.isPathFile(path);

				let data = this._soundButtonFactory.getButtonDataByElement($button);

				data.path = encodedPath;

				if (!data.isEdited) {
					data.title = file.name;

					// Random color from file name
					data.color = {
						h: StringUtilities.getHue(file.name),
						s: 100,
						l: data.color.l,
					};
				}

				this._gridSoundButtonChildFactory.updateSoundButtonByElement($button, data);

				e.preventDefault();
			})
			.on("dragleave", `.${SoundButtonDispatcher.SOUNDBUTTON_CLASS}`, (e) => {
				getTarget(e).removeClass("file-dragover");

				e.preventDefault();
			});

		function getTarget(e: JQuery.DragEventBase): SoundButtonElementJQuery {
			return $(e.target);
		}
	}
}
