class SoundButtonFactory implements ISoundButtonFactory {
	private SOUNDBUTTON_ID_PREFIX = "soundbutton-";

	private _soundButtonCollection: SoundButtonCollection;
	private _sanitizer: SoundButtonSanitizer;

	constructor(
		soundButtonCollection: SoundButtonCollection,
		sanitizer: SoundButtonSanitizer
	) {
		this._soundButtonCollection = soundButtonCollection;
		this._sanitizer = sanitizer;
	}

	public createSoundButton(
		index: number,
		data?: SoundButtonData
	): [SoundButtonElementJQuery, SoundButtonData] {
		let $button = this.generateSoundButtonElement(index);

		this.updateElementData($button, index, data);

		return [$button, data];
	}

	public updateElementData(
		$button: SoundButtonElementJQuery,
		index: number,
		data?: SoundButtonData
	): [SoundButtonElementJQuery, SoundButtonData] {
		data = this._sanitizer.sanitizeData(index, data);

		return [$button, data];
	}

	public getButtonData(parsedIndex: string): SoundButtonData {
		let { index } = this.getCompositeSoundButtonId(parsedIndex);

		return this._soundButtonCollection.getButtonData(index);
	}

	private generateSoundButtonElement(index: number): SoundButtonElementJQuery {
		let $button = $<SoundButtonElement>("<button>", {
			type: "button",
			id: this.parseSoundButtonId(index),
			class: "soundbutton",
			style: `--index: ${index};`,
		}).append(
			$("div", {
				class: "button-theme",
			})
		);

		return $button;
	}

	private parseSoundButtonId(
		index: number,
		collection?: SoundButtonDataCollection
	): string {
		collection ??= this._soundButtonCollection.getActiveCollection();

		return `${this.SOUNDBUTTON_ID_PREFIX}${collection.id}-${index}`;
	}

	private getCompositeSoundButtonId(parsedIndex: string): {
		collectionId: number;
		index: number;
	} {
		let [collectionId, index] = parsedIndex
			.replace(this.SOUNDBUTTON_ID_PREFIX, "")
			.split("-")
			.map((id) => parseInt(id));

		return {
			collectionId,
			index,
		};
	}
}
