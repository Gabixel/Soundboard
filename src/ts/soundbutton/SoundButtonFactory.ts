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
		id: number,
		initialButtonData?: SoundButtonData
	): [SoundButtonElementJQuery, SoundButtonData] {
		let [$button, buttonData] = this.updateElementData(
			this.generateSoundButtonElement(id),
			id,
			initialButtonData
		);

		return [$button, buttonData];
	}

	public updateElementData(
		$button: SoundButtonElementJQuery,
		buttonId: number,
		buttonData?: SoundButtonData
	): [SoundButtonElementJQuery, SoundButtonData] {
		buttonData = this._sanitizer.sanitizeData(buttonId, buttonData);

		$button
			.attr("id", this._idGenerator.parseSoundButtonId(buttonId))
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

	private generateSoundButtonElement(index: number): SoundButtonElementJQuery {
		let $button = $<SoundButtonElement>("<button>", {
			type: "button",
			class: "soundbutton",
			style: `--index: ${index};`,
		}).append(
			$("<div>", {
				class: "button-theme",
			})
		);

		return $button;
	}
}
