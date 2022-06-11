class SoundButton {
	private static paths: string[] = ["../sounds/Bad to the bone.mp3"];
	private static $grid: JQuery<HTMLElement>;

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
			title: (index + 1).toString(),
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
			.css("--lightness", data.color.l.toString() + "%")

			// Item drop
			.on("dragenter", (e: JQuery.DragEnterEvent) => {
				e.stopPropagation();
				e.preventDefault();
				e.originalEvent.dataTransfer.dropEffect = "link";

				$button.addClass("dragover");
				console.log("dragenter");
			})
			.on("dragover", (e: JQuery.DragOverEvent) => {
				e.preventDefault();
				e.stopPropagation();
				e.originalEvent.dataTransfer.dropEffect = "link";

				// $button.addClass("dragover");
			})
			.on("drop", (e: JQuery.DropEvent) => {
				console.log("drop");

				const notSuccesful =
					!e.originalEvent.dataTransfer ||
					!e.originalEvent.dataTransfer.files.length;

				if (notSuccesful) return;

				e.preventDefault();
				e.stopPropagation();

				$button.removeClass("dragover");

				const files = e.originalEvent.dataTransfer.files;

				for (let i = 0; i < files.length; i++) {
					// @ts-ignore
					console.log(files[i].path);
				}

				// @ts-ignore
				$button.attr("data-path", decodeURI(files[0].path));
				$button.text(files[0].name);
			})
			.on("dragleave", (e: JQuery.DragLeaveEvent) => {
				e.preventDefault();
				e.stopPropagation();

				$button.removeClass("dragover");
				console.log("dragleave");
				// $button.on("dragover");
			});
	}

	public static setGrid(grid: JQuery<HTMLElement>): void {
		this.$grid = grid;
	}

	public static setContextMenu() {
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

			SoundBoardApi.openContextMenu(args);
		});
	}

	public static setClick(): void {
		this.$grid.on("click", ".soundbutton", (e) => {
			const $button = $(e.target);
			const path = $button.attr("data-path");

			AudioPlayer.addAudio(path, e.shiftKey);
			updatePlayPauseButton();
		});
	}
}
