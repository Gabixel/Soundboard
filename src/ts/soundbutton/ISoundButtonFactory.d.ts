interface ISoundButtonFactory {
	createSoundButton(index: number, data?: SoundButtonData): SoundButtonElementJQuery;
	updateElementData(
		$button: SoundButtonElementJQuery,
		index: number,
		data?: SoundButtonData
	): SoundButtonElementJQuery;
}
