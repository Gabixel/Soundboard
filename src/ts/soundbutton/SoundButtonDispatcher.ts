class SoundButtonDispatcher<
	TAudioPlayer extends IAudioPlayer = IAudioPlayer
> extends SoundButtonAudio {
	private _defaultAudioPaths: Readonly<string[]> = ["Clown Horn.mp3"];

	private _soundButtonFactory: SoundButtonFactory;
	private _soundButtonCollection: SoundButtonCollection;

	constructor(
		factory: SoundButtonFactory,
		soundButtonCollection: SoundButtonCollection,
		audioPlayer: TAudioPlayer
	) {
		super(audioPlayer);

		this._soundButtonFactory = factory;
		this._soundButtonCollection = soundButtonCollection;
	}
}
