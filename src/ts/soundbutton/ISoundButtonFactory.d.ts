interface ISoundButtonFactory {
	createSoundButton(
		buttonId: number,
		collectionId: number,
		data: SoundButtonData
	): SoundButtonElementJQuery;
	updateElementData(
		$button: SoundButtonElementJQuery,
		buttonId: number,
		collectionId: number,
		data: SoundButtonData
	): void;
}
