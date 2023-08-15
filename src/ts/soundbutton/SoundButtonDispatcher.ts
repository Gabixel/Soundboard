class SoundButtonDispatcher<
	TAudioPlayer extends IAudioPlayer = IAudioPlayer
> extends SoundButtonAudio {
	private _defaultAudioPaths: Readonly<string[]> = ["Clown Horn.mp3"];

	private _soundButtonFactory: SoundButtonFactory;

	constructor(
		factory: SoundButtonFactory,
		audioPlayer: TAudioPlayer
	) {
		super(audioPlayer);

		this._soundButtonFactory = factory;
	}

	public createSoundButton(index: number, data?: SoundButtonData): SoundButtonElementJQuery {
		let $button = this._soundButtonFactory.createSoundButton(index, data);

		return $button;
	}

	
}
