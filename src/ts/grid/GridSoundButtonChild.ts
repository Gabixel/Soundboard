class GridSoundButtonChild {
	private _soundButtonDispatcher: SoundButtonDispatcher;
	private _soundButtonEvents: SoundButtonEvents;

	constructor(
		soundButtonDispatcher: SoundButtonDispatcher,
		soundButtonEvents: SoundButtonEvents
	) {
		this._soundButtonDispatcher = soundButtonDispatcher;
		this._soundButtonEvents = soundButtonEvents;
	}

	public createSoundButton(
		index: number,
		data: SoundButtonData
	): SoundButtonElementJQuery {
		let $button = this._soundButtonDispatcher.createSoundButton(index, data);

		this._soundButtonEvents.addEvents($button);

		return $button;
	}
}
