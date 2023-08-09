class SoundButtonFactory implements ISoundButtonFactory {
	private static DEFAULT_BUTTONDATA: SoundButtonDataNoId = {
		isEdited: false,
		title: "-",
		color: { h: 0, s: 0, l: 80 },
		image: null,
		tags: [],
		time: {
			start: 0,
			end: 0,
			condition: "after",
		},
		volume: 1,
		path: null,
	};

	private _defaultAudioPaths: Readonly<string[]> = ["Clown Horn.mp3"];

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
		const defaultData = this.getDefaultData(index);

		if (!data) {
			return defaultData;
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

	private getDefaultData(index: number): SoundButtonData {
		let initialData: SoundButtonDataNoId = SoundButtonFactory.DEFAULT_BUTTONDATA;

		let data: SoundButtonData = {
			index,
			...initialData,
		};

		return data;
	}
}
