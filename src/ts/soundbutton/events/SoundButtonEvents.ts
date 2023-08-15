class SoundButtonEvents<TAudioPlayer extends IAudioPlayer = IAudioPlayer> {
	constructor() {}

	public addEvents(
		$button: SoundButtonElementJQuery,
		soundButtonFactory: SoundButtonFactory,
		audioPlayer: TAudioPlayer
	): void {
		this.addClickEvent($button, soundButtonFactory, audioPlayer);
		this.addContextMenuEvent($button);
		this.addSwap($button);
	}

	private addClickEvent(
		$button: SoundButtonElementJQuery,
		soundButtonFactory: SoundButtonFactory,
		audioPlayer: TAudioPlayer
	) {
		$button.on("click", (e) => {
			const { path, volume, time } = soundButtonFactory.getButtonData(
				$button.attr("id")
			);

			const options: AudioSourceOptions = {
				src: path,
				volume,
				audioTimings: time,
			};

			const useSecondaryStorage = e.shiftKey;

			audioPlayer.play(options, useSecondaryStorage);
		});
	}

	private addContextMenuEvent(_$button: SoundButtonElementJQuery) {
		// TODO
	}

	private addSwap(_$button: SoundButtonElementJQuery) {
		// TODO
	}
}
