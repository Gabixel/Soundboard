class SoundButtonFactory implements ISoundButtonFactory {
	private _defaultAudioPaths: Readonly<string[]> = ["Clown Horn.mp3"];

	private _idGenerator: ISoundButtonIdGenerator;
	private _collectionStore: SoundButtonCollectionStore;
	private _sanitizer: SoundButtonSanitizer;

	constructor(
		idGenerator: ISoundButtonIdGenerator,
		collectionStore: SoundButtonCollectionStore,
		sanitizer: SoundButtonSanitizer
	) {
		this._idGenerator = idGenerator;
		this._collectionStore = collectionStore;
		this._sanitizer = sanitizer;
	}

	public createSoundButton(
		buttonId: number,
		collectionId: number,
		initialButtonData?: SoundButtonData
	): [SoundButtonElementJQuery, SoundButtonData] {
		let [$button, buttonData] = this.updateElementData(
			this.generateSoundButtonElement(buttonId),
			buttonId,
			collectionId,
			initialButtonData
		);

		return [$button, buttonData];
	}

	public updateElementData(
		$button: SoundButtonElementJQuery,
		buttonId: number,
		collectionId: number,
		buttonData?: SoundButtonData
	): [SoundButtonElementJQuery, SoundButtonData] {
		buttonData = this._sanitizer.sanitizeData(buttonId, buttonData);

		let parsedId = this._idGenerator.parseSoundButtonId(buttonId, collectionId);

		$button
			.attr("id", parsedId)
			// TODO: apply image
			.attr("data-tags", buttonData.tags.join(","))
			// Color
			.css("--hue", buttonData.color.h.toString())
			.css("--saturation", buttonData.color.s.toString() + "%")
			.css("--lightness", buttonData.color.l.toString() + "%")
			// Title
			.children(".button-theme")
			.text(buttonData.title);

		return [$button, buttonData];
	}

	public getButtonDataByElement(
		$button: SoundButtonElementJQuery
	): SoundButtonData {
		let { buttonId } = this._idGenerator.getCompositeSoundButtonId(
			$button.attr("id")
		);
		return this.getButtonDataById(buttonId);
	}

	public getButtonDataByParsedId(parsedButtonId: string): SoundButtonData {
		let { buttonId } =
			this._idGenerator.getCompositeSoundButtonId(parsedButtonId);
		return this.getButtonDataById(buttonId);
	}

	public getButtonDataById(id: number): SoundButtonData {
		return this._collectionStore.getButtonData(id);
	}

	public async getRandomAudioPath(): Promise<string> {
		return StringUtilities.encodeFilePath(
			await SoundboardApi.mainWindow.joinPaths(
				SoundboardApi.global.path.root,
				SoundboardApi.global.path.sounds,
				this._defaultAudioPaths[EMath.randomInt(0, this._defaultAudioPaths.length)]
			)
		);
	}

	/**
	 * @returns The collection id.
	 */
	public swapElements(
		$button1: SoundButtonElementJQuery,
		$button2: SoundButtonElementJQuery
	): {
		collectionId: number;
		dataId1: number;
		dataId2: number;
	} {
		let button1Index = this._idGenerator.getCompositeSoundButtonId(
			$button1.attr("id")
		);

		let button2Index = this._idGenerator.getCompositeSoundButtonId(
			$button2.attr("id")
		);

		$button1.attr(
			"id",
			this._idGenerator.parseSoundButtonId(
				button2Index.buttonId,
				button2Index.collectionId
			)
		);
		$button2.attr(
			"id",
			this._idGenerator.parseSoundButtonId(
				button1Index.buttonId,
				button1Index.collectionId
			)
		);

		$button1.css(SoundButtonDispatcher.INDEX_CSS_VAR, button2Index.buttonId);
		$button2.css(SoundButtonDispatcher.INDEX_CSS_VAR, button1Index.buttonId);

		return {
			collectionId: button1Index.collectionId,
			dataId1: button1Index.buttonId,
			dataId2: button2Index.buttonId,
		};
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
