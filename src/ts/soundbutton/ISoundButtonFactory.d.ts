interface ISoundButtonFactory {
	createSoundButton(index: number, data?: SoundButtonData): SoundButtonElementJQ;
	updateElementData(
		$button: SoundButtonElementJQ,
		index: number,
		data?: SoundButtonData
	): SoundButtonElementJQ;
}
