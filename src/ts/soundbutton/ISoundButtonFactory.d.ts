interface ISoundButtonFactory {
	/**
	 * Creates a JQuery sound button element with the specified button ID, collection ID, and button data.
	 *
	 * @param buttonId - The ID of the button
	 * @param collectionId - The ID of the collection
	 * @param buttonData - The data for the button
	 * @returns The created JQuery button
	 */
	createSoundButton(
		buttonId: number,
		collectionId: number,
		data: SoundButtonData
	): SoundButtonElementJQuery;

	/**
	 * Updates the data of a JQuery sound button.
	 *
	 * @param $button - The JQuery button element to update
	 * @param buttonId - The ID of the button
	 * @param collectionId - The ID of the collection
	 * @param buttonData - The data to update the button with
	 * @returns The updated button object
	 */
	updateElementData(
		$button: SoundButtonElementJQuery,
		buttonId: number,
		collectionId: number,
		data: SoundButtonData
	): void;
}
