interface ISoundButtonFactory {
	createSoundButton(index: number, data?: SoundButtonData): [SoundButtonElementJQuery, SoundButtonData];
	updateElementData(
		$button: SoundButtonElementJQuery,
		index: number,
		data?: SoundButtonData
	): [SoundButtonElementJQuery, SoundButtonData];
}
