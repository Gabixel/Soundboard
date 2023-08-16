class GridSoundButtonIdGenerator implements ISoundButtonIdGenerator {
	private SOUNDBUTTON_ID_PREFIX = "soundbutton-";

	private _soundButtonCollection: SoundButtonCollectionStore;

	constructor(_soundButtonCollection: SoundButtonCollectionStore) {
		this._soundButtonCollection = _soundButtonCollection;
	}
	
	public parseSoundButtonId(
		buttonId: number,
		collectionId: number
	): string {
		return `${this.SOUNDBUTTON_ID_PREFIX}${collectionId}-${buttonId}`;
	}

	public getCompositeSoundButtonId(parsedButtonId: string): {
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
