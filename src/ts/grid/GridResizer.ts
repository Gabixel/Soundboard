/**
 * Resize (rescale) logic for the {@link GridManager}
 */
class GridResizer extends Logger {
	private _gridManager: GridManager;
	private _buttonFilterer: ButtonFilterer;
	private _soundButtonManager: SoundButtonManager;

	private resizerInitialized: boolean = false;
	private resizingRow: boolean = false;
	private resizingColumn: boolean = false;

	constructor(
		gridManager: GridManager,
		soundButtonManager: SoundButtonManager,
		buttonFilterer: ButtonFilterer
	) {
		super();

		this._gridManager = gridManager;
		this._buttonFilterer = buttonFilterer;
		this._soundButtonManager = soundButtonManager;

		GridResizer.logDebug(null, "Initialized!");
	}

	/**
	 * Initializes events for the grid resize logic
	 */
	public async setInputs(
		$rowsInput: JQuery<HTMLInputElement>,
		$columnsInput: JQuery<HTMLInputElement>,
		$clearButton: JQuery<HTMLInputElement>
	): Promise<this> {
		// Initialize grid
		this.updateAxis($rowsInput, "row");
		this.updateAxis($columnsInput, "col");
		await this.updateGrid();

		// Initialize events
		$rowsInput
			.on("change", async (e) => {
				this.resizingRow = true;

				try {
					this.updateAxis($(e.target), "row");
					await this.updateGrid();
				} finally {
					this.resizingRow = false;
				}
			})
			.on("wheel", async (e) => {
				// Prevent base scrolling behavior (if chromium triggers it)
				e.stopImmediatePropagation();

				// UI Scale prevention
				if (e.ctrlKey) return;

				// Prevent racing conditions when resizing
				if (this.resizingRow) return;

				// Update input value
				EventFunctions.updateInputValueFromWheel(e);
			});

		$columnsInput
			.on("change", async (e) => {
				this.resizingColumn = true;

				try {
					this.updateAxis($(e.target), "col");
					await this.updateGrid();
				} finally {
					this.resizingColumn = false;
				}
			})
			.on("wheel", (e) => {
				// Prevent base scrolling behavior (if chromium triggers it)
				e.stopImmediatePropagation();

				// UI Scale prevention
				if (e.ctrlKey) return;

				// Prevent racing conditions when resizing
				if (this.resizingColumn) return;

				// Update input value
				EventFunctions.updateInputValueFromWheel(e);
			});

		$clearButton.on("click", async () => {
			if (this.resizingRow || this.resizingColumn) return;

			this._gridManager.$grid.empty();
			this._gridManager.resetSoundButtonCount();
			await this.updateGrid();
		});

		return this;
	}

	private async updateGrid(): Promise<void> {
		await this.fillEmptyCells();

		this.updateVisibleButtons();

		this.updateButtonFontSize();
	}

	private updateAxis($e: JQuery<HTMLInputElement>, axis: "row" | "col") {
		const axisSize = this.clampGridSizeValue($e);

		switch (axis) {
			case "row":
				if (this._gridManager.rows == axisSize) {
					return;
				}

				this._gridManager.$grid.css("--rows", axisSize);
				this._gridManager.setRows(axisSize);
				break;
			case "col":
				if (this._gridManager.cols == axisSize) {
					return;
				}

				this._gridManager.$grid.css("--columns", axisSize);
				this._gridManager.setColumns(axisSize);
				break;
		}
	}

	private clampGridSizeValue($e: JQuery<HTMLInputElement>): number {
		const $target = $e;
		const value = parseInt($target.val().toString());

		let max = parseFloat($target.attr("max").toString());
		let min = parseFloat($target.attr("min").toString());

		let clampedValue = EMath.clamp(value, min, max);

		$target.val(clampedValue);

		return clampedValue;
	}

	private updateVisibleButtons(): void {
		let sortedButtons = this._gridManager.$buttons
			.toArray()
			.sort(function (a: HTMLElement, b: HTMLElement): number {
				const aIndex = parseInt($(a).css("--index").toString());
				const bIndex = parseInt($(b).css("--index").toString());
				return aIndex - bIndex;
			});

		$(sortedButtons).each((_i: number, e: HTMLElement): void => {
			const index = parseInt($(e).css("--index").toString());

			if (index >= this._gridManager.size) {
				$(e).addClass("hidden");
			} else {
				$(e).removeClass("hidden");
			}
		});
	}

	private async fillEmptyCells(): Promise<void> {
		if (!this._gridManager.isGridIncomplete) return;

		const emptyCells = this._gridManager.size - this._gridManager.buttonCount;

		for (let i = 0; i < emptyCells; i++) {
			const $button = $(
				SoundboardApi.isProduction
					? this._soundButtonManager.generateButton(
							null,
							this._gridManager.size + i - emptyCells
					  )
					: await this._soundButtonManager.generateRandomButton(
							this._gridManager.size + i - emptyCells
					  )
			);

			// TODO: Not sure if it's better triggering the filter instead of this.
			// In that case, all existing buttons will light again (thanks to the animation).
			if (this._buttonFilterer.isFiltering) {
				this._buttonFilterer.filterButton($button);
			}

			this._gridManager.$grid.append($button[0]);

			this._gridManager.increaseSoundButtonCount();
		}
	}

	// TODO: update on window resize and on ui scale change
	private updateButtonFontSize(): void {
		const $el = $(this._gridManager.getButtonAtIndex(0));

		const minFontSize = 10; /*parseInt($(document.body).css("font-size").toString());*/
		const maxFontSize = window.devicePixelRatio > 1 ? 24 : 16;

		const minButtonSize = Math.min($el.innerHeight(), $el.innerWidth());
		let finalSize = (minButtonSize - parseFloat($el.css("padding-top")) * 2) / 2;

		finalSize = EMath.clamp(finalSize, minFontSize, maxFontSize);

		this._gridManager.$grid.css("--button-font-size", finalSize + "px");
	}
}
