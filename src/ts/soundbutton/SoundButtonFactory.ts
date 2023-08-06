class SoundButtonFactory {
	private _defaultAudioPaths: string[] = ["Clown Horn.mp3"];

	public createSoundButton(
		index: number,
		data?: SoundButtonData
	): SoundButtonElementJQ {
		let $button = this.generateSoundButtonElement();

		this.applyData($button, index, data);

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

	private applyData(
		$button: JQuery<SoundButtonElement>,
		index: number,
		data?: SoundButtonData
	): SoundButtonElementJQ {
		if (!data) {
			data = this.getDefaultData(index);
		}

		// TODO

		return $button;
	}

	private getDefaultData(index: number): SoundButtonData {
		return {
			isEdited: false,
			index,
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
	}
}
