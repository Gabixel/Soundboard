class SoundButton extends LogExtend {
	private static paths: string[] = [
		"Bad to the bone.mp3",
		// "Polygon Dust.mp3",
		// "He's a Pirate.mp3",
	];
	private static $grid: JQuery<HTMLElement>;

	private static getRandomPath(): string {
		return encodeURI(
			"../../resources/sounds/" + this.paths[EMath.randomInt(0, this.paths.length)]
		);
	}

	public static generateRandom(index: number): HTMLElement {
		let [h, s, l] = [
			EMath.randomInt(0, 361),
			EMath.randomInt(0, 100),
			EMath.randomInt(30, 100),
		];

		let data: SoundButtonData = {
			title: (index + 1).toString(),
			color: { h, s, l },
			image: "",
			tags: [],
			path: this.getRandomPath(),
			index: index,
		};

		return SoundButton.createWithData(data);
	}

	public static createWithData(data: SoundButtonData): HTMLElement {
		const $button = $(
			`<button type="button" class="soundbutton"></button>`
		);

		$button.text(data.title).append(`<div class="outline-overlay"></div>`);

		this.applyData($button, data);

		return $button[0];
	}

	private static applyData(
		$button: JQuery<HTMLElement>,
		data: SoundButtonData
	): void {
		$button
			.attr("id", "sound_btn_" + (data.index + 1))
			.attr("tabindex", data.index + 1)
			.css("--index", data.index.toString())

			// TODO: apply color
			// TODO: apply image
			// .data("tags", data.tags)
			.attr("data-path", data.path)

			.css("--hue", data.color.h.toString())
			.css("--saturation", data.color.s.toString() + "%")
			.css("--lightness", data.color.l.toString() + "%")

			// Item drop
			.on("dragenter", (e: JQuery.DragEnterEvent) => {
				e.stopPropagation();
				e.preventDefault();
				e.originalEvent.dataTransfer.dropEffect = "link";

				$button.addClass("dragover");
				this.log(this.applyData, "'dragenter' triggered");
			})
			.on("dragover", (e: JQuery.DragOverEvent) => {
				e.preventDefault();
				e.stopPropagation();
				e.originalEvent.dataTransfer.dropEffect = "link";

				// $button.addClass("dragover");
			})
			.on("drop", (e: JQuery.DropEvent) => {
				this.log(this.applyData, "'drop' triggered");

				const notSuccesful =
					!e.originalEvent.dataTransfer ||
					!e.originalEvent.dataTransfer.files.length;

				if (notSuccesful) return;

				e.preventDefault();
				e.stopPropagation();

				$button.removeClass("dragover");

				const file = e.originalEvent.dataTransfer.files[0];

				// @ts-ignore
				const path: string = file.path;

				// Local files (at least on Windows) have backslashes instead of forward slashes. This causes problems since JS treats them as escaping characters. This is a workaround.
				const encodedPath = encodeURI(path.replace(/\\/g, "/"));

				this.log(
					this.applyData,
					"Audio drop successful.\n" +
						"• Files: %O\n" +
						"\t---------\n" +
						"• First file: %O\n" +
						"\t---------\n" +
						"• First file path (encoded for browser): %O",
					e.originalEvent.dataTransfer.files,
					e.originalEvent.dataTransfer.files[0],
					// @ts-ignore
					encodedPath
				);

				SoundboardApi.isPathFile(path);

				// @ts-ignore
				$button.attr("data-path", encodedPath);
				$button.text(file.name); // of course, this is temporary
			})
			.on("dragleave", (e: JQuery.DragLeaveEvent) => {
				e.preventDefault();
				e.stopPropagation();

				// $button.on("dragover");
				$button.removeClass("dragover");
				this.log(this.applyData, "'dragleave' triggered");
			});
	}

	public static setGrid(grid: JQuery<HTMLElement>): void {
		this.$grid = grid;
		this.initClick();
		this.initContextMenu();
	}

	private static initContextMenu() {
		this.$grid.on("contextmenu", ".soundbutton", (e) => {
			e.stopPropagation(); // To prevent the document's trigger
			// TODO: convert to async call

			let $target = $(e.target);

			let args = {
				type: "soundbutton",
				x: e.clientX.toString(),
				y: e.clientY.toString(),
				buttonData: {
					title: $target.text(),
					color: {
						h: parseInt($target.css("--hue")),
						s: parseInt($target.css("--saturation")),
						l: parseInt($target.css("--lightness")),
					},
					image: $target.attr("data-image"),
					tags: $target.data("tags"),
					path: $target.attr("data-path"),
					index: parseInt($target.css("--index")),
				} as SoundButtonData,
			};

			SoundboardApi.openContextMenu(args);
		});
	}

	private static initClick(): void {
		this.$grid.on("click", ".soundbutton", (e) => {
			this.log(this.initClick, `SoundButton "%s" clicked`, $(e.target).text());

			const $button = $(e.target);
			const path = $button.attr("data-path");

			AudioPlayer.addAudio(path, e.shiftKey);
		});
	}
}
