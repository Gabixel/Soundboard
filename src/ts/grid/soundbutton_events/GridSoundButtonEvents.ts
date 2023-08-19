class GridSoundButtonEvents<TAudioPlayer extends IAudioPlayer = IAudioPlayer> {
	private _audioPlayer: TAudioPlayer;
	private _soundButtonDispatcher: SoundButtonDispatcher;
	private _soundButtonFactory: SoundButtonFactory;

	private _soundButtonSwap: GridSoundButtonSwap;

	constructor(
		audioPlayer: TAudioPlayer,
		soundButtonDispatcher: SoundButtonDispatcher,
		soundButtonFactory: SoundButtonFactory
	) {
		this._audioPlayer = audioPlayer;
		this._soundButtonDispatcher = soundButtonDispatcher;
		this._soundButtonFactory = soundButtonFactory;
	}

	public addEvents($grids_container: JQuery<HTMLElement>): void {
		this.addClickEvent($grids_container);
		this.addContextMenuEvent($grids_container);
		this.addSwap($grids_container);
	}

	public cancelSwap(): void {
		this._soundButtonSwap.cancelSwap();
	}

	private addClickEvent($grids_container: JQuery<HTMLElement>) {
		// TODO: rate-limit while holding the button with a "send" key (i.e. Enter)

		$grids_container.on(
			"click",
			`.${SoundButtonDispatcher.SOUNDBUTTON_CLASS}`,
			(e) => {
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

	private addContextMenuEvent($grids_container: JQuery<HTMLElement>) {
		$grids_container.on(
			"contextmenu",
			`.${SoundButtonDispatcher.SOUNDBUTTON_CLASS}`,
			(e) => {
				e.stopPropagation(); // To prevent the document's trigger

				let $target = $(e.target);
				let buttonData = this._soundButtonFactory.getButtonDataByElement($target);

				let args: ContextMenuArgs = {
					type: "soundbutton",
					buttonData,
				};

				SoundboardApi.mainWindow.openContextMenu(args);
			}
		);
	}

	private addSwap($grids_container: JQuery<HTMLElement>) {
		this._soundButtonSwap = new GridSoundButtonSwap(
			this._soundButtonDispatcher,
			$grids_container,
			SoundButtonDispatcher.SOUNDBUTTON_CLASS
		);
	}

	private addDragAndDropEvents(_$grids_container: JQuery<HTMLElement>) {
		// TODO
	}
}
