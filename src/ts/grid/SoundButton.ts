abstract class SoundButton extends Logger {
	private static paths: string[] = [
		"Clown Horn.mp3"
	];
	private static $grid: JQuery<HTMLElement>;

	private static dropEffect: "none" | "copy" | "link" | "move" = "none";

	private static getRandomAudio(): string {
		let path = SoundboardApi.joinPaths(
			SoundboardApi.resolveAppPath(Main.RESOURCES_PATH, "sounds"),
			this.paths[EMath.randomInt(0, this.paths.length)]
		);

		return StringUtilities.encodeFilePath(path);
	}

	public static generateRandom(index: number): HTMLElement {
		/*let [h, s, l] = [
			EMath.randomInt(0, 361),
			EMath.randomInt(0, 100),
			EMath.randomInt(30, 100),
		];*/

		let [h, s, l] = [0, 0, 80];

		let data: SoundButtonData = {
			title: (index + 1).toString(),
			color: { h, s, l },
			image: "",
			tags: [""],
			path: this.getRandomAudio(),
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
				this.logDebug(this.addDragAndDrop, "'dragenter' triggered");

				e.stopPropagation();
				e.preventDefault();
				e.originalEvent.dataTransfer.dropEffect = this.dropEffect;

				$button.addClass("file-dragover");
			})
			.on("dragover", (e: JQuery.DragOverEvent) => {
				e.preventDefault();
				e.stopPropagation();
				e.originalEvent.dataTransfer.dropEffect = "link";

				// $button.addClass("file-dragover");
			})
			// TODO: https://www.electronjs.org/docs/latest/tutorial/native-file-drag-drop
			.on("drop", (e: JQuery.DropEvent) => {
				this.logDebug(this.addDragAndDrop, "'drop' triggered");

				const notSuccesful =
					!e.originalEvent.dataTransfer ||
					!e.originalEvent.dataTransfer.files.length;

				// TODO: check if file type is supported by the browser.

				if (notSuccesful) return;

				e.preventDefault();
				e.stopPropagation();

				$button.removeClass("file-dragover");

				const file = e.originalEvent.dataTransfer.files[0] as ElectronFile;

				const path: string = file.path;

				const encodedPath = StringUtilities.encodeFilePath(path);

				console.log(encodedPath);

				this.logInfo(
					this.addDragAndDrop,
					"Audio drop successful.\n" +
						"• Files: %O\n" +
						"\t---------\n" +
						"• First file: %O\n" +
						"\t---------\n" +
						"• First file path (encoded for browser): %O",
					e.originalEvent.dataTransfer.files,
					e.originalEvent.dataTransfer.files[0],
					encodedPath
				);

				// SoundboardApi.isPathFile(path); // TODO

				$button.attr("data-path", encodedPath);
				$button.children(".button-theme").text(file.name); // TODO: of course, this is temporary
			})
			.on("dragleave", (e: JQuery.DragLeaveEvent) => {
				this.logDebug(this.addDragAndDrop, "'dragleave' triggered");

				e.preventDefault();
				e.stopPropagation();

				// $button.on("dragover");
				$button.removeClass("file-dragover");
			});
	}

	public static updateData(
		_$button: JQuery<HTMLElement>, // TODO:
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

	public static initialize(grid: JQuery<HTMLElement>): void {
		this.$grid = grid;
		this.initClick();
		this.initContextMenu();

		this.logInfo(this.initialize, "Initialized!");
	}

	private static initContextMenu() {
		this.$grid.on("contextmenu", ".soundbutton", (e) => {
			e.stopPropagation(); // To prevent the document's trigger
			// TODO: convert to async call

			let $target = $(e.target);

			let args: ContextMenuArgs = {
				type: "soundbutton",
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
			this.logInfo(
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

	// TODO: Create a constructor and use it inside itself?
}
