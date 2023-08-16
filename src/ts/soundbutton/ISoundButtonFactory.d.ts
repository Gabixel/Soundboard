interface ISoundButtonFactory {
	createSoundButton(
		buttonId: number,
		collectionId: number,
		data?: SoundButtonData
	): [SoundButtonElementJQuery, SoundButtonData];
	updateElementData(
		$button: SoundButtonElementJQuery,
		buttonId: number,
		collectionId: number,
		data?: SoundButtonData
	): [SoundButtonElementJQuery, SoundButtonData];
}
