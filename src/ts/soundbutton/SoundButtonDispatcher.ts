class SoundButtonDispatcher {
	public static readonly SOUNDBUTTON_CLASS: string = "soundbutton";
	public static readonly INDEX_CSS_VAR: string = "--index";

	private _soundButtonFactory: SoundButtonFactory;

	constructor(
		factory: SoundButtonFactory
	) {
		this._soundButtonFactory = factory;
	}

	public createSoundButton(
		buttonId: number,
		collectionId: number,
		initialData?: SoundButtonData
	): [SoundButtonElementJQuery, SoundButtonData] {
		let [$button, data] = this._soundButtonFactory.createSoundButton(
			buttonId,
			collectionId,
			initialData
		);

		return [$button, data];
	}
}
