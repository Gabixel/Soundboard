/**
 * A factory class for creating and managing sound buttons.
 */
class SoundButtonFactory implements ISoundButtonFactory {
	private static _defaultAudioPaths: Readonly<string[]> = ["Clown Horn.mp3"];

	private _idGenerator: ISoundButtonIdGenerator;
	private _collectionStore: SoundButtonCollectionStore;

	public static async getRandomAudioPath(): Promise<string> {
		return StringUtilities.encodeFilePath(
			await SoundboardApi.mainWindow.joinPaths(
				SoundboardApi.global.path.root,
				SoundboardApi.global.path.sounds,
				this._defaultAudioPaths[EMath.randomInt(0, this._defaultAudioPaths.length)]
			)
		);
	}

	constructor(
		idGenerator: ISoundButtonIdGenerator,
		collectionStore: SoundButtonCollectionStore
	) {
		this._idGenerator = idGenerator;
		this._collectionStore = collectionStore;
	}

	/**
	 * @inheritdoc
	 */
	public createSoundButton(
		buttonId: number,
		collectionId: number,
		buttonData: SoundButtonData
	): SoundButtonElementJQuery {
		let $button = this.generateSoundButtonElement(buttonId);

		this.updateElementData($button, buttonId, collectionId, buttonData);

		return $button;
	}

	/**
	 * Updates the element data of a sound button identified by its parsed ID.
	 *
	 * @param parsedId - The parsed ID of the sound button
	 * @param buttonData - The updated data for the sound button
	 * @returns The updated sound button object
	 */
	public updateElementDataByParsedId(
		parsedId: string,
		buttonData: SoundButtonData
	): SoundButtonElementJQuery {
		let $button = this.getButtonElementByParsedId(parsedId);

		let { buttonId, collectionId } = this.getCompositeSoundButtonId(parsedId);

		return this.updateElementData($button, buttonId, collectionId, buttonData);
	}

	/**
	 * @inheritdoc
	 */
	public updateElementData(
		$button: SoundButtonElementJQuery,
		buttonId: number,
		collectionId: number,
		buttonData: SoundButtonData
	): SoundButtonElementJQuery {
		let parsedId = this.getParsedSoundButtonId(buttonId, collectionId);

		return (
			$button
				.attr("id", parsedId)
				// TODO: apply image
				// Color
				.css("--hue", buttonData.color.h.toString())
				.css("--saturation", buttonData.color.s.toString() + "%")
				.css("--lightness", buttonData.color.l.toString() + "%")
				// Title
				.children(".button-theme")
				.text(buttonData.title) as SoundButtonElementJQuery
		);
	}

	/**
	 * Retrieves the {@link SoundButtonData} associated with the given JQuery sound button.
	 *
	 * @param $button - The JQuery button representing the sound button
	 * @returns The {@link SoundButtonData} associated with the JQuery button
	 */
	public getButtonDataByElement(
		$button: SoundButtonElementJQuery
	): SoundButtonData {
		let { buttonId } = this.getCompositeSoundButtonId($button.attr("id"));
		return this.getButtonDataById(buttonId);
	}

	/**
	 * Retrieves the {@link SoundButtonData} for a given (**parsed**) button ID
	 *
	 * @param parsedButtonId - The parsed button ID
	 * @returns The {@link SoundButtonData} for the specified button ID.
	 */
	public getButtonDataByParsedId(parsedButtonId: string): SoundButtonData {
		let { buttonId } = this.getCompositeSoundButtonId(parsedButtonId);
		return this.getButtonDataById(buttonId);
	}

	/**
	 * Retrieves the {@link SoundButtonData} associated with the specified button ID (in the currently active collection).
	 *
	 * @param id - The button ID from the currently active collection
	 * @returns The {@link SoundButtonData} object
	 */
	public getButtonDataById(id: number): SoundButtonData {
		return this._collectionStore.getButtonData(id);
	}

	public getButtonElement(
		buttonId: number,
		collectionId: number
	): SoundButtonElementJQuery {
		return this.getButtonElementByParsedId(
			this.getParsedSoundButtonId(buttonId, collectionId)
		);
	}

	public getButtonElementByParsedId(parsedId: string): SoundButtonElementJQuery {
		return $(`#${parsedId}`);
	}

	public getParsedSoundButtonId(buttonId: number, collectionId: number): string {
		return this._idGenerator.getParsedSoundButtonId(buttonId, collectionId);
	}

	public getCompositeSoundButtonId(parsedButtonId: string): {
		buttonId: number;
		collectionId: number;
	} {
		return this._idGenerator.getCompositeSoundButtonId(parsedButtonId);
	}

	/**
	 * @returns The collection id.
	 */
	public swapElements(
		$button1: SoundButtonElementJQuery,
		$button2: SoundButtonElementJQuery
	): void {
		let button1Index = this.getCompositeSoundButtonId($button1.attr("id"));

		let button2Index = this.getCompositeSoundButtonId($button2.attr("id"));

		$button1.attr(
			"id",
			this.getParsedSoundButtonId(button2Index.buttonId, button2Index.collectionId)
		);
		$button2.attr(
			"id",
			this.getParsedSoundButtonId(button1Index.buttonId, button1Index.collectionId)
		);

		$button1.css(SoundButtonDispatcher.INDEX_CSS_VAR, button2Index.buttonId);
		$button2.css(SoundButtonDispatcher.INDEX_CSS_VAR, button1Index.buttonId);

		UserInterface.swapElements($button1, $button2);
	}

	private generateSoundButtonElement(index: number): SoundButtonElementJQuery {
		let $button = $<SoundButtonElement>("<button>", {
			type: "button",
			class: SoundButtonDispatcher.SOUNDBUTTON_CLASS,
			style: `${SoundButtonDispatcher.INDEX_CSS_VAR}: ${index};`,
		}).append(
			$("<div>", {
				class: "button-theme",
			})
		);

		return $button;
	}
}
