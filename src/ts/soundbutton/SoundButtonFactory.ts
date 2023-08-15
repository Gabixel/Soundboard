class SoundButtonFactory implements ISoundButtonFactory {
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
	): SoundButtonElementJQuery {
		let $button = this.generateSoundButtonElement();

		this.updateElementData($button, index, data);

		return $button;
	}

	public updateElementData(
		$button: SoundButtonElementJQuery,
		index: number,
		data?: SoundButtonData
	): SoundButtonElementJQuery {
		data = this._sanitizer.sanitizeData(index, data);

		return $button;
	}

	private generateSoundButtonElement(): SoundButtonElementJQuery {
		let $button = $<SoundButtonElement>("<button>", {
			type: "button",
			id: "",
			class: "soundbutton",
		}).append(
			$("div", {
				class: "button-theme",
			})
		);

		return $button;
	}
}
