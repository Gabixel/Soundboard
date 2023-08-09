class SoundButtonFactory implements ISoundButtonFactory {
	private _defaultData: SoundButtonDataNoId;

	constructor(defaultData: SoundButtonDataNoId) {
		this._defaultData = defaultData;
	}

	public createSoundButton(
		index: number,
		data?: SoundButtonData
	): SoundButtonElementJQ {
		let $button = this.generateSoundButtonElement();

		this.updateElementData($button, index, data);

		return $button;
	}

	public updateElementData(
		$button: SoundButtonElementJQ,
		index: number,
		data?: SoundButtonData
	): SoundButtonElementJQ {
		data = this.sanitizeData(index, data);

		// TODO

		return $button;
	}

	private generateSoundButtonElement(): SoundButtonElementJQ {
		let $button = $<SoundButtonElement>("<button>", {
			type: "button",
			class: "soundbutton",
		}).append(
			$("div", {
				class: "button-theme",
			})
		);

		return $button;
	}

	private sanitizeData(index: number, data?: SoundButtonData): SoundButtonData {
		const defaultData = this._defaultData;

		if (!data) {
			return {
				index,
				...defaultData,
			};
		}

		return {
			isEdited: true,
			index,
			title: data.title || defaultData.title,
			color: data.color || defaultData.color,
			image: data.image || defaultData.image,
			tags: data.tags || defaultData.tags,
			time: data.time || defaultData.time,
			volume: data.volume || defaultData.volume,
			path: data.path || defaultData.path,
		};
	}
}
