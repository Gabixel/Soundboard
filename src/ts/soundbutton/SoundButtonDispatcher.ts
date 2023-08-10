class SoundButtonDispatcher {
	private DEFAULT_BUTTONDATA: Readonly<SoundButtonDataNoId> = {
		isEdited: false,
		title: "-",
		color: { h: 0, s: 0, l: 80 },
		image: null,
		tags: [],
		time: {
			start: 0,
			end: 0,
			condition: "after",
		},
		volume: 1,
		path: null,
	};

	private _defaultAudioPaths: Readonly<string[]> = ["Clown Horn.mp3"];

	private _factory: SoundButtonFactory;
	private _soundButtonCollection: SoundButtonCollection;

	constructor(factory: SoundButtonFactory, soundButtonCollection: SoundButtonCollection) {
		this._factory = factory;
		this._soundButtonCollection = soundButtonCollection;
	}
}