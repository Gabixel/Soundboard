class SoundButtonDispatcher {
	private static DEFAULT_BUTTONDATA: SoundButtonDataNoId = {
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

	constructor(factory: SoundButtonFactory) {
		this._factory = factory;
	}
}