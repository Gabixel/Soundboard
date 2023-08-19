class GridSoundButtonIdGenerator implements ISoundButtonIdGenerator {
	private static readonly SOUNDBUTTON_ID_PREFIX: string = "soundbutton-";

	private _soundButtonCollection: SoundButtonCollectionStore;

	constructor(_soundButtonCollection: SoundButtonCollectionStore) {
		this._soundButtonCollection = _soundButtonCollection;
	}
	
	public parseSoundButtonId(
		buttonId: number,
		collectionId: number
	): string {
		return `${GridSoundButtonIdGenerator.SOUNDBUTTON_ID_PREFIX}${collectionId}-${buttonId}`;
	}

	public getCompositeSoundButtonId(parsedButtonId: string): {
		buttonId: number;
		collectionId: number;
	} {
		let [collectionId, buttonId] = parsedButtonId
			.replace(GridSoundButtonIdGenerator.SOUNDBUTTON_ID_PREFIX, "")
			.split("-")
			.map((id) => parseInt(id));

		return {
			collectionId,
			buttonId,
		};
	}
}
