class GridSoundButtonChildFactory {
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

		this._soundButtonCollectionStore.addButtonDataIfMissing(
			collectionId,
			buttonData
		);

		return [$button, buttonData];
	}

	public getSortedSoundButtonElements(
		$grid: JQuery<HTMLElement>
	): SoundButtonElementJQuery[] {
		return this._soundButtonDispatcher.getSortedSoundButtonElements($grid);
	}

	public swapSoundButtons(
		$button1: SoundButtonElementJQuery,
		$button2: SoundButtonElementJQuery
	): void {
		let { collectionId, dataId1, dataId2 } =
			this._soundButtonDispatcher.swapSoundButtons($button1, $button2);

		this._soundButtonCollectionStore.swapButtonData(collectionId, dataId1, dataId2);
	}
}
