class SoundButton {
	private static paths: string[] = [
		"file:///C:/Users/Gabriel/Documents/Soundboard%20Sounds/HappyHippo.mp3",
		// "file:///G:/DownloadVideo/8%20Bit%20flying%20music%20-%20DuckTales%20Music%20(NES)%20-%20The%20Moon%20Theme.mp3",
		// "file:///G:/DownloadVideo/Chad%20meme%20song.mp3",
		// "file:///G:/DownloadVideo/Crazy%20Japanese%20Man%20running%20in%20tunnel%20screaming%20Sex%20at%20the%20top%20of%20his%20lungs%20but%20it's%20an%20Anime.mp3",
		// "file:///G:/DownloadVideo/David%20Cutter%20Music%20-%20Sunroof.mp3",
		// "file:///G:/DownloadVideo/Epic%20Inception%20Sound%20Effect.mp3",
		// "file:///G:/DownloadVideo/Fazlija%20-%20Helikopter.mp3",
		// "file:///G:/DownloadVideo/Bad%20to%20the%20bone.mp3",
		// "file:///G:/Video/Adobe%20Premiere%20Pro/Sound%20Effects/Ba%20Dum%20Tss.mp3",
		"file:///C:/Users/Gabriel/Desktop/Soundboard/YouveBeenGnomed.mp3",
		// "file:///G:/DownloadVideo/Discord%20ping.mp3",
		// "file:///C:/Users/Gabriel/Downloads/Holy_Hand_Grenade_Hallelujah.wav",
	];

	private static getRandomPath(): string {
		return this.paths[EMath.randomInt(0, this.paths.length)];
	}

	public static generateRandom(index: number): HTMLElement {
		let [h, s, l] = [
			EMath.randomInt(0, 361),
			EMath.randomInt(0, 100),
			EMath.randomInt(30, 100),
		];

		let data: SoundButtonData = {
			title: index.toString(),
			color: { h, s, l },
			image: "",
			tags: [],
			path: this.getRandomPath(),
			index: index,
		};

		return SoundButton.generate(data);
	}

	public static generate(data: SoundButtonData): HTMLElement {
		const $button = $(
			`<button type="button" class="soundbutton">${data.title}</button>`
		);

		this.applyData($button, data);

		return $button[0];
	}

	private static applyData(
		$button: JQuery<HTMLElement>,
		data: SoundButtonData
	): void {
		$button
			.attr("id", "sound_btn_" + data.index)
			.attr("tabindex", data.index)
			.css("--index", data.index.toString())

			// TODO: apply color
			// TODO: apply image
			// .data("tags", data.tags)
			.attr("data-path", data.path)

			.css("--hue", data.color.h.toString())
			.css("--saturation", data.color.s.toString() + "%")
			.css("--lightness", data.color.l.toString() + "%");
	}
}
