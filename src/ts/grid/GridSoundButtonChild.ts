class GridSoundButtonChild {
	private _soundButtonDispatcher: SoundButtonDispatcher;

	constructor(soundButtonDispatcher: SoundButtonDispatcher) {
		this._soundButtonDispatcher = soundButtonDispatcher;
	}

	public createSoundButton(
		index: number,
		initialData: SoundButtonData
	): [SoundButtonElementJQuery, SoundButtonData] {
		let [$button, data] = this._soundButtonDispatcher.createSoundButton(
			index,
			initialData
		);

		return [$button, data];
	}
}
