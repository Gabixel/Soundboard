abstract class SoundButton {
	private static paths: string[] = [
		"Bad to the bone.mp3",
		// "Polygon Dust.mp3",
		// "He's a Pirate.mp3",
	];
	private static $grid: JQuery<HTMLElement>;

	private static dropEffect: "none" | "copy" | "link" | "move" = "none";

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
			tags: [""],
			path: this.getRandomPath(),
			time: {
				start: 0, //20500,//19300,//62265, // TODO
				end: 0,
				condition: "after",
			},
		};

		return SoundButton.createWithData(data, index);
	}

	public static createWithData(
		data: SoundButtonData,
		index: number
	): HTMLElement {
		const $button = $(`<button type="button" class="soundbutton"></button>`);
		$button.append(`<div class="button-theme">${data.title}</div>`);

		this.applyInitialData($button, data, index);

		return $button[0];
	}

	private static applyInitialData(
		$button: JQuery<HTMLElement>,
		data: SoundButtonData,
		index: number
	): void {
		$button
			.attr("id", "sound_btn_" + index)
			.attr("tabindex", index + 1)
			.css("--index", index.toString())

			// TODO: apply color
			// TODO: apply image
			.attr("data-path", data.path)
			.attr("data-tags", data.tags.join(","))

			.attr("data-start-time", data.time.start)
			.attr("data-end-time", data.time.end)
			.attr("data-end-type", data.time.condition)

			.css("--hue", data.color.h.toString())
			.css("--saturation", data.color.s.toString() + "%")
			.css("--lightness", data.color.l.toString() + "%");

		this.addDragAndDrop($button);
	}

	private static addDragAndDrop($button: JQuery<HTMLElement>): void {
		$button
			.on("dragenter", (e: JQuery.DragEnterEvent) => {
				e.stopPropagation();
				e.preventDefault();
				e.originalEvent.dataTransfer.dropEffect = this.dropEffect;

				$button.addClass("file-dragover");
				Logger.logInfo(this.name, this.applyInitialData, "'dragenter' triggered");
			})
			.on("dragover", (e: JQuery.DragOverEvent) => {
				e.preventDefault();
				e.stopPropagation();
				e.originalEvent.dataTransfer.dropEffect = "link";

				// $button.addClass("file-dragover");
			})
			.on("drop", (e: JQuery.DropEvent) => {
				Logger.logInfo(this.name, this.applyInitialData, "'drop' triggered");

				const notSuccesful =
					!e.originalEvent.dataTransfer ||
					!e.originalEvent.dataTransfer.files.length;

				// TODO: check if file type is supported by the browser.

				if (notSuccesful) return;

				e.preventDefault();
				e.stopPropagation();

				$button.removeClass("file-dragover");

				const file = e.originalEvent.dataTransfer.files[0];

				// @ts-ignore
				const path: string = file.path;

				// Local files (at least on Windows) have backslashes instead of forward slashes. This causes problems since JS treats them as escaping characters.
				const encodedPath = encodeURIComponent(path.replace(/\\/g, "/"))
					.replace(/(%2F)+/g, "/") // Replace slashes
					.replace(/(%3A)+/g, ":"); // Replace colons

				Logger.logInfo(
					this.name,
					this.applyInitialData,
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

				// SoundboardApi.isPathFile(path); // TODO

				// @ts-ignore
				$button.attr("data-path", encodedPath);
				$button.children(".button-theme").text(file.name); // of course, this is temporary
			})
			.on("dragleave", (e: JQuery.DragLeaveEvent) => {
				e.preventDefault();
				e.stopPropagation();

				// $button.on("dragover");
				$button.removeClass("file-dragover");
				Logger.logInfo(this.name, this.applyInitialData, "'dragleave' triggered");
			});
	}

	public static updateData(
		$button: JQuery<HTMLElement>,
		data: SoundButtonData
	): void {
		const keys = Object.keys(data);
		for (let i = 0; i < keys.length; i++) {
			switch (keys[i]) {
				case "title":
					// TODO: change title
					break;
			}
		}
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
					title: $target.children(".button-theme").text(),
					color: {
						h: parseInt($target.css("--hue")),
						s: parseInt($target.css("--saturation")),
						l: parseInt($target.css("--lightness")),
					},
					image: $target.attr("data-image"),
					tags: $target
						.attr("data-tags")
						.split(" ")
						.filter((tag) => tag.length > 0),
					path: $target.attr("data-path"),
					index: parseInt($target.css("--index")),
				} as SoundButtonData,
			};

			SoundboardApi.openContextMenu(args);
		});
	}

	private static initClick(): void {
		this.$grid.on("click", ".soundbutton", (e) => {
			Logger.logInfo(
				this.name,
				this.initClick,
				`SoundButton "%s" clicked`,
				$(e.target).children(".button-theme").text()
			);

			const $button = $(e.target);

			const path = $button.attr("data-path");

			const time: AudioTimings = {
				start: parseInt($button.attr("data-start-time")),
				end: parseInt($button.attr("data-end-time")),
				condition: $button.attr("data-end-type") as "at" | "after",
			};

			const useMultiPool = e.shiftKey; // If the shift key is pressed, use the multi-pool

			AudioPlayer.addAudio(path, time, useMultiPool);
		});
	}

	// Create a constructor and use it inside itself?
}
