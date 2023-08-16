class GridSoundButtonChild {
	private _soundButtonDispatcher: SoundButtonDispatcher;
	private _soundButtonCollectionStore: SoundButtonCollectionStore;

	constructor(
		soundButtonDispatcher: SoundButtonDispatcher,
		soundButtonCollectionStore: SoundButtonCollectionStore
	) {
		this._soundButtonDispatcher = soundButtonDispatcher;
		this._soundButtonCollectionStore = soundButtonCollectionStore;
	}

	public createSoundButton(
		buttonId: number,
		collectionId: number,
		initialData?: SoundButtonData
	): [SoundButtonElementJQuery, SoundButtonData] {
		let [$button, buttonData] = this._soundButtonDispatcher.createSoundButton(
			buttonId,
			collectionId,
			initialData
		);

		this._soundButtonCollectionStore.addButtonDataIfMissing(collectionId, buttonData);

		return [$button, buttonData];
	}
}
