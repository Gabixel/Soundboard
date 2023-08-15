class SoundButtonDispatcher {
	private _defaultAudioPaths: Readonly<string[]> = ["Clown Horn.mp3"];

	private _soundButtonFactory: SoundButtonFactory;
	private _soundButtonEvents: SoundButtonEvents;
	private _audioPlayer: IAudioPlayer;

	constructor(
		factory: SoundButtonFactory,
		soundButtonEvents: SoundButtonEvents,
		audioPlayer: IAudioPlayer
	) {
		this._soundButtonFactory = factory;
		this._soundButtonEvents = soundButtonEvents;
		this._audioPlayer = audioPlayer;
	}

	public createSoundButton(
		index: number,
		initialData?: SoundButtonData
	): [SoundButtonElementJQuery, SoundButtonData] {
		let [$button, data] = this._soundButtonFactory.createSoundButton(
			index,
			initialData
		);

		this._soundButtonEvents.addEvents(
			$button,
			this._soundButtonFactory,
			this._audioPlayer
		);

		return [$button, data];
	}
}
