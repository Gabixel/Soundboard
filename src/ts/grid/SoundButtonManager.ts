/**
 * Sound buttons management
 */
class SoundButtonManager extends Logger {
	private static DEFAULT_METADATA: SoundButtonData = {
		title: "-",
		color: { h: 0, s: 0, l: 80 },
		image: null,
		tags: [],
		path: null,
		time: {
			start: 0,
			end: 0,
			condition: "after",
		},
	};
	
	private _randomPaths: string[] = ["Clown Horn.mp3"];
	private _$grid: JQuery<HTMLElement>;

	/**
	 * Returns a random audio file from a set of hardcoded paths (for testing purposes)
	 */
	private async getRandomAudio(): Promise<string> {
		return StringUtilities.encodeFilePath(
			await SoundboardApi.mainWindow.joinPaths(
				SoundboardApi.global.path.root,
				SoundboardApi.global.path.sounds,
				this._randomPaths[EMath.randomInt(0, this._randomPaths.length)]
			)
		);
	}

	// TODO: remove random gen
	constructor($grid: JQuery<HTMLElement>) {
		super();

		this._$grid = $grid;

		SoundButtonManager.logDebug(null, "Initialized!");
	}

	public generateButton(
		data: null | SoundButtonData = null,
		index: null | number = null
	): HTMLElement {
		if (!StringUtilities.isDefined(data)) {
			data = SoundButtonManager.DEFAULT_METADATA;
		}

		return SoundButtonManager.createWithData(data, index);
	}

	public async generateRandomButton(
		index: null | number = null
	): Promise<HTMLElement> {
		let [h, s, l] = [
			EMath.randomInt(0, 361),
			EMath.randomInt(0, 100),
			EMath.randomInt(30, 100),
		];

		let data: SoundButtonData = {
			title: isNaN(index)
				? SoundButtonManager.DEFAULT_METADATA.title
				: (index + 1).toString(),
			color: { h, s, l },
			image: SoundButtonManager.DEFAULT_METADATA.image,
			tags: SoundButtonManager.DEFAULT_METADATA.tags,
			path: await this.getRandomAudio(),
			time: SoundButtonManager.DEFAULT_METADATA.time,
		};

		return SoundButtonManager.createWithData(data, index);
	}

	public static createWithData(
		data: SoundButtonData,
		index: null | number
	): HTMLElement {
		const $button = $(`<button type="button" class="soundbutton"></button>`);
		$button.append(`<div class="button-theme"></div>`);

		this.applyInitialData($button, data, index);
		this.setupDragAndDrop($button);

		return $button[0];
	}

	private static applyInitialData(
		$button: JQuery<HTMLElement>,
		buttonData: SoundButtonData,
		index: null | number
	): void {
		$button
			// Identifier
			.attr("id", "sound_btn_" + index)

			// Tab index
			.attr("tabindex", index + 1)

			// CSS flex index
			.css("--index", index.toString());

		this.applyButtonData($button, buttonData);
	}

	public static updateButton(id: string, buttonData: SoundButtonData): void {
		const $button = $("#" + id);

		// If the button doesn't exist
		if ($button.length < 1) {
			Logger.logDebug(SoundButtonManager.updateButton, "Button not found, ignoring changes.\n", buttonData);
			return;
		}

		Logger.logInfo(SoundButtonManager.updateButton, "Applying button data:\n", buttonData);

		this.applyButtonData($button, buttonData);
	}

	public static setupDragAndDrop($button: JQuery<HTMLElement>): void {
		$button
			.on("dragenter", (e: JQuery.DragEnterEvent) => {
				SoundButtonManager.logDebug(this.setupDragAndDrop, "'dragenter' triggered");

				e.stopPropagation();
				e.preventDefault();
				e.originalEvent.dataTransfer.dropEffect = "link";

				$button.addClass("file-dragover");
			})
			.on("dragover", (e: JQuery.DragOverEvent) => {
				e.preventDefault();
				e.stopPropagation();
				e.originalEvent.dataTransfer.dropEffect = "link";
			})
			// TODO: https://www.electronjs.org/docs/latest/tutorial/native-file-drag-drop
			.on("drop", (e: JQuery.DropEvent) => {
				SoundButtonManager.logDebug(this.setupDragAndDrop, "'drop' triggered");

				const notSuccesful =
					!e.originalEvent.dataTransfer ||
					!e.originalEvent.dataTransfer.files.length;

				// TODO: check if file type is supported by the browser.

				if (notSuccesful) return;

				e.preventDefault();
				e.stopPropagation();

				$button.removeClass("file-dragover");

				const file = e.originalEvent.dataTransfer.files[0];

				const path: string = file.path;

				const encodedPath = StringUtilities.encodeFilePath(path);

				console.log(encodedPath);

				SoundButtonManager.logInfo(
					this.setupDragAndDrop,
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

				// TODO: use `updateButton` instead

				$button.attr("data-path", encodedPath);
				// Set button text to the file name
				// TODO: of course, this is temporary
				$button.children(".button-theme").text(file.name);

				// Set random hue for button (based on file name conversion)
				$button.css("--hue", StringUtilities.getHue(file.name).toString());
				$button.css("--saturation", "100%");
			})
			.on("dragleave", (e: JQuery.DragLeaveEvent) => {
				SoundButtonManager.logDebug(this.setupDragAndDrop, "'dragleave' triggered");

				e.preventDefault();
				e.stopPropagation();

				// $button.on("dragover");
				$button.removeClass("file-dragover");
			});
	}

	public setupClick(): this {
		if (!StringUtilities.isDefined(this._$grid)) {
			return this;
		}

		this._$grid.on("click", ".soundbutton", (e) => {
			SoundButtonManager.logDebug(
				this.setupClick,
				`Button "%s" clicked`,
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

			// TODO: inject player
			AudioPlayer.addAudio(path, time, useMultiPool);
		});

		return this;
	}

	public setupContextMenu(): this {
		if (!StringUtilities.isDefined(this._$grid)) {
			return this;
		}

		this._$grid.on("contextmenu", ".soundbutton", (e) => {
			e.stopPropagation(); // To prevent the document's trigger
			// TODO: convert to async call

			let $target = $(e.target);

			let args: ContextMenuArgs = {
				type: "soundbutton",
				id: $target.attr("id"),
				buttonData: SoundButtonManager.getButtonData($target),
			};

			SoundboardApi.mainWindow.openContextMenu(args);
		});

		return this;
	}

	private static sanitizeButtonData(data: SoundButtonData): SoundButtonData {
		const defaultData = SoundButtonManager.DEFAULT_METADATA;

		return {
			title: data.title ?? defaultData.title,
			color: data.color ?? defaultData.color,
			image: data.image ?? defaultData.image,
			path: data.path ?? defaultData.path,
			tags: data.tags ?? defaultData.tags,
			time: data.time ?? defaultData.time,
		};
	}

	private static applyButtonData(
		$button: JQuery<HTMLElement>,
		buttonData: SoundButtonData
	): void {
		// Check for problems
		buttonData = this.sanitizeButtonData(buttonData);

		$button
			// TODO: apply color
			// TODO: apply image
			.attr("data-path", buttonData.path)
			.attr("data-tags", buttonData.tags.join(","))

			// Timings
			.attr("data-start-time", buttonData.time.start)
			.attr("data-end-time", buttonData.time.end)
			.attr("data-end-type", buttonData.time.condition)

			// Color
			.css("--hue", buttonData.color.h.toString())
			.css("--saturation", buttonData.color.s.toString() + "%")
			.css("--lightness", buttonData.color.l.toString() + "%");

		$button.children(".button-theme").text(buttonData.title);
	}

	private static getButtonData($button: JQuery<HTMLElement>): SoundButtonData {
		return {
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
			path: $button.attr("data-path"),
		};
	}
}
