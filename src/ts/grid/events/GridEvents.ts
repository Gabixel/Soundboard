class GridEvents extends EventTarget {
	private _audioPlayer: IAudioPlayer;
	private _soundButtonFactory: SoundButtonFactory;
	private _gridSoundButtonChildFactory: GridSoundButtonChildFactory;
	private _gridResizer: GridResizer;

	private _gridSoundButtonSwap: GridSoundButtonSwap;
	private _gridSoundButtonEdit: GridSoundButtonEdit;

	constructor(
		audioPlayer: IAudioPlayer,
		soundButtonFactory: SoundButtonFactory,
		gridSoundButtonChildFactory: GridSoundButtonChildFactory,
		gridResizer: GridResizer
	) {
		super();

		this._audioPlayer = audioPlayer;
		this._soundButtonFactory = soundButtonFactory;
		this._gridSoundButtonChildFactory = gridSoundButtonChildFactory;
		this._gridResizer = gridResizer;
	}

	public addSoundButtonEvents($gridsContainer: JQuery<HTMLElement>): void {
		this.addSoundButtonClick($gridsContainer);
		this.addSoundButtonMovementFocus($gridsContainer);
		this.addSoundButtonContextMenu($gridsContainer);
		this.addSoundButtonSwap($gridsContainer);
		this.addSoundButtonDragAndDrop($gridsContainer);
	}

	public addClearButtonClickEvent(
		$clearGridButton: JQuery<HTMLButtonElement>,
		clickCallback: () => void
	) {
		$clearGridButton.on("click", clickCallback);
	}

	public cancelSwap(): void {
		this._gridSoundButtonSwap.cancelSwap();
	}

	private addSoundButtonClick($gridsContainer: JQuery<HTMLElement>): void {
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

				const audioSettings: AudioSourceSettings = {
					src: path,
					volume,
					audioTimings: time,
				};

				const useSecondaryStorage = e.shiftKey;

				this._audioPlayer.play(audioSettings, useSecondaryStorage);
			}
		);
	}

	private addSoundButtonMovementFocus(
		$gridsContainer: JQuery<HTMLElement>
	): void {
		$gridsContainer.on(
			"keydown",
			`.${SoundButtonDispatcher.SOUNDBUTTON_CLASS}`,
			(e) => {
				let isArrowKey = e.key.startsWith("Arrow");

				if (!isArrowKey) {
					return;
				}

				if (!$(e.target).hasClass(SoundButtonDispatcher.SOUNDBUTTON_CLASS)) {
					return;
				}

				const columnCount = this._gridResizer.columns;
				const buttonCount = this._gridResizer.size;

				let tabIndex = parseInt($(e.target).css("--index"));

				switch (e.key) {
					case "ArrowLeft":
						if (tabIndex % columnCount > 0) {
							tabIndex--;
						}

						break;
					case "ArrowRight":
						if (
							tabIndex % columnCount < columnCount - 1 &&
							tabIndex < buttonCount - 1
						) {
							tabIndex++;
						}

						break;
					case "ArrowUp":
						if (tabIndex >= columnCount) {
							tabIndex -= columnCount;
						}

						break;
					case "ArrowDown":
						if (tabIndex < buttonCount - columnCount) {
							tabIndex += columnCount;
						}

						break;
				}

				$(e.target).parent().find(`[style*="--index: ${tabIndex};"]`)[0]?.focus();
			}
		);
	}

	private addSoundButtonContextMenu($gridsContainer: JQuery<HTMLElement>): void {
		this._gridSoundButtonEdit = new GridSoundButtonEdit(
			this._gridSoundButtonChildFactory
		).handleEditEvent(($button, reset, animateIfReset) => {
			this._gridSoundButtonEdit.triggerButtonEditEvent(
				$button,
				reset,
				animateIfReset
			);
		});

		$(this._gridSoundButtonEdit).on("buttonedit", (e) => {
			this.dispatchEvent(
				new CustomEvent(`buttonedit`, {
					detail: e.detail,
				})
			);
		});

		$gridsContainer.on(
			"contextmenu",
			`.${SoundButtonDispatcher.SOUNDBUTTON_CLASS}`,
			(e) => {
				// To prevent the document's trigger even though it's not bound, but just in case...
				e.stopPropagation();

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

	private addSoundButtonSwap($gridsContainer: JQuery<HTMLElement>): void {
		this._gridSoundButtonSwap = new GridSoundButtonSwap(
			this._gridSoundButtonChildFactory,
			$gridsContainer
		);

		$(this._gridSoundButtonSwap).on("buttonswap", () => {
			this.dispatchEvent(new CustomEvent("buttonswap"));
		});
	}

	private addSoundButtonDragAndDrop($gridsContainer: JQuery<HTMLElement>): void {
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

				// TODO: check if file type is supported / allowed.
				// SoundboardApi.isPathFile(path);

				let buttonData = this._soundButtonFactory.getButtonDataByElement($button);

				buttonData.path = encodedPath;

				if (!buttonData.isEdited) {
					let title = file.name;

					if (file.type) {
						title =
							title.lastIndexOf(".") != -1
								? title.substring(0, title.lastIndexOf("."))
								: title;
					}

					buttonData.title = title;

					// Random color from file name
					buttonData.color = {
						h: StringUtilities.getHue(file.name),
						s: 100,
						l: buttonData.color.l,
					};
				}

				this._gridSoundButtonChildFactory.updateSoundButtonByElement(
					$button,
					buttonData
				);

				this._gridSoundButtonEdit.triggerButtonEditEvent($button);

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
