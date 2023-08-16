class GridSoundButtonEvents<TAudioPlayer extends IAudioPlayer = IAudioPlayer> {
	private _audioPlayer: TAudioPlayer;
	private _soundButtonFactory: SoundButtonFactory;

	constructor(
		audioPlayer: TAudioPlayer,
		soundButtonFactory: SoundButtonFactory
	) {
		this._audioPlayer = audioPlayer;
		this._soundButtonFactory = soundButtonFactory;
	}

	public addEvents($grids_container: JQuery<HTMLElement>): void {
		this.addClickEvent($grids_container);
		this.addContextMenuEvent($grids_container);
		this.addSwap($grids_container);
	}

	private addClickEvent($grids_container: JQuery<HTMLElement>) {
		// TODO: rate-limit while holding the button with a "send" key (i.e. Enter)

		$grids_container.on("click", ".soundbutton", (e) => {
			Logger.logDebug(
				`Button "%s" clicked`,
				$(e.target).children(".button-theme").text()
			);

			const { path, volume, time } = this._soundButtonFactory.getButtonDataById(
				$(e.target).attr("id")
			);

			const options: AudioSourceOptions = {
				src: path,
				volume,
				audioTimings: time,
			};

			const useSecondaryStorage = e.shiftKey;

			this._audioPlayer.play(options, useSecondaryStorage);
		});
	}

	private addContextMenuEvent($grids_container: JQuery<HTMLElement>) {
		$grids_container.on("contextmenu", ".soundbutton", (e) => {
			e.stopPropagation(); // To prevent the document's trigger

			let $target = $(e.target);
			let buttonData = this._soundButtonFactory.getButtonDataByElement($target);

			let args: ContextMenuArgs = {
				type: "soundbutton",
				buttonData,
			};

			SoundboardApi.mainWindow.openContextMenu(args);
		});
	}

	private addSwap(_$grids_container: JQuery<HTMLElement>) {
		// TODO
	}

	private addDragAndDropEvents(_$grids_container: JQuery<HTMLElement>) {
		// TODO
	}
}
