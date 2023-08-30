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
		let { buttonId: buttonId1, collectionId } =
			this._soundButtonDispatcher.getCompositeSoundButtonId($button1.attr("id"));

		let buttonId2 = this._soundButtonDispatcher.getCompositeSoundButtonId(
			$button2.attr("id")
		).buttonId;

		this._soundButtonCollectionStore.swapButtonData(
			collectionId,
			buttonId1,
			buttonId2
		);

		this._soundButtonDispatcher.swapSoundButtons($button1, $button2);
	}

	public updateSoundButtonByElement(
		$button: SoundButtonElementJQuery,
		buttonData: SoundButtonData
	) {
		this.updateSoundButton($button.attr("id"), buttonData);
	}

	public updateSoundButton(parsedId: string, buttonData: SoundButtonData): void {
		let { buttonId, collectionId } =
			this._soundButtonDispatcher.getCompositeSoundButtonId(parsedId);

		this._soundButtonCollectionStore.editButtonData(
			buttonId,
			collectionId,
			buttonData
		);

		this._soundButtonDispatcher.updateSoundButton(parsedId, buttonData);
	}
}
