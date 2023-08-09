class SoundButtonFactory {
	private _defaultAudioPaths: string[] = ["Clown Horn.mp3"];

	// private _datafunction: SoundButtonDataFunction = {

	// }
	// private dataFunction<TKey extends keyof SoundButtonData>(key: TKey): AnyFunc {

	// }

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

	private getData($button: JQuery<SoundButtonElement>): SoundButtonData {
		return {
			isEdited: !!$button.attr("data-is-edited"),
			index: parseInt($button.css("--index")),
			title: $button.children(".button-theme").text(),
			color: {
				h: parseInt($button.css("--hue")),
				s: parseInt($button.css("--saturation")),
				l: parseInt($button.css("--lightness")),
			},
			image: $button.attr("data-image"),
			tags: $button
				.attr("data-tags")
				.split(" ")
				.filter((tag) => tag.length > 0),
			// TODO: time: null,
			volume: parseFloat($button.attr("data-volume")),
			path: $button.attr("data-path"),
		};
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
