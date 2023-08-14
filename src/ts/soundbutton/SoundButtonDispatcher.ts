class SoundButtonDispatcher<TAudioPlayer extends IAudioPlayer = IAudioPlayer> implements IGridChildDispatcher {
	private _defaultAudioPaths: Readonly<string[]> = ["Clown Horn.mp3"];

	private _soundButtonFactory: SoundButtonFactory;
	private _soundButtonCollection: SoundButtonCollection;

	constructor(factory: SoundButtonFactory, soundButtonCollection: SoundButtonCollection) {
		this._soundButtonFactory = factory;
		this._soundButtonCollection = soundButtonCollection;
	}
	

}