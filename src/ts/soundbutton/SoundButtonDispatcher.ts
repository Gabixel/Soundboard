class SoundButtonDispatcher {
	private _soundButtonFactory: SoundButtonFactory;

	constructor(
		factory: SoundButtonFactory
	) {
		this._soundButtonFactory = factory;
	}

	public createSoundButton(
		index: number,
		initialData?: SoundButtonData
	): [SoundButtonElementJQuery, SoundButtonData] {
		let [$button, data] = this._soundButtonFactory.createSoundButton(
			index,
			initialData
		);

		return [$button, data];
	}
}
