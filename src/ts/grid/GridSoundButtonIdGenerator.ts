class GridSoundButtonIdGenerator implements ISoundButtonIdGenerator {
	private SOUNDBUTTON_ID_PREFIX = "soundbutton-";

	private _soundButtonCollection: SoundButtonCollectionStore;

	constructor(_soundButtonCollection: SoundButtonCollectionStore) {
		this._soundButtonCollection = _soundButtonCollection;
	}

	parseSoundButtonId(
		buttonId: number,
		collection?: SoundButtonDataCollection
	): string {
		collection ??= this._soundButtonCollection.getActiveCollection();

		return `${this.SOUNDBUTTON_ID_PREFIX}${collection.id}-${buttonId}`;
	}

	getCompositeSoundButtonId(parsedButtonId: string): {
		collectionId: number;
		buttonId: number;
	} {
		let [collectionId, buttonId] = parsedButtonId
			.replace(this.SOUNDBUTTON_ID_PREFIX, "")
			.split("-")
			.map((id) => parseInt(id));

		return {
			collectionId,
			buttonId,
		};
	}
}
