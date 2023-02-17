abstract class GridResizer {
	// TODO: Dependency Injection
	// private static _grid: Grid;
	private static resizerInitialized = false;

	// public static setGrid(grid: Grid): void {
	// 	this._grid = grid;
	// }

	public static initialize(
		$rowsInput: JQuery<HTMLElement>,
		$columnsInput: JQuery<HTMLElement>,
		$clearButton: JQuery<HTMLElement>
	): void {
		$rowsInput
			.on("change", (e) => {
				this.updateRows(e);
				if (this.resizerInitialized) this.updateGrid();
			})
			.on("wheel", (e) => {
				if (e.ctrlKey) return;
				// e.preventDefault();
				e.stopImmediatePropagation();
				EventFunctions.updateInputValueFromWheel(e);
			});

		$columnsInput
			.on("change", (e) => {
				this.updateColumns(e);
				if (this.resizerInitialized) this.updateGrid();
			})
			.on("wheel", (e) => {
				if (e.ctrlKey) return;
				e.preventDefault();
				e.stopImmediatePropagation();
				EventFunctions.updateInputValueFromWheel(e);
			});

		$clearButton.on("click", () => {
			Grid.$grid.empty();
			Grid.resetSoundButtonCount();
			this.updateGrid();
		});

		this.initResizer();
	}

	private static initResizer() {
		$("#grid-rows, #grid-columns").trigger("change"); // Initializes grid
		this.resizerInitialized = true;
		this.updateGrid();
	}

	private static updateGrid() {
		this.fillEmptyCells();

		this.updateVisibleButtons();
		this.updateButtonFontSize();
	}

	private static clampGridSizeValue($e: JQuery.ChangeEvent): number {
		const $target = $($e.target);
		const value = parseInt($target.val().toString());

		let max = parseFloat($target.attr("max").toString());
		let min = parseFloat($target.attr("min").toString());

		let clampedValue = EMath.clamp(value, min, max);

		$target.val(clampedValue);

		return clampedValue;
	}

	private static updateRows($e: JQuery.ChangeEvent) {
		const rows = this.clampGridSizeValue($e);

		Grid.$grid.css("--rows", rows);

		Grid.setRows(rows);
	}

	private static updateColumns($e: JQuery.ChangeEvent) {
		const columns = this.clampGridSizeValue($e);

		Grid.$grid.css("--columns", columns);

		Grid.setColumns(columns);
	}

	private static updateVisibleButtons(): void {
		let sortedButtons = Grid.$buttons
			.toArray()
			.sort(function (a: HTMLElement, b: HTMLElement): number {
				const aIndex = parseInt($(a).css("--index").toString());
				const bIndex = parseInt($(b).css("--index").toString());
				return aIndex - bIndex;
			});

		$(sortedButtons).each((_i: number, e: HTMLElement) => {
			const index = parseInt($(e).css("--index").toString());

			if (index >= Grid.size) {
				$(e).addClass("hidden");
			} else {
				$(e).removeClass("hidden");
			}
		});
	}

	private static fillEmptyCells(): void {
		if (!Grid.isGridIncomplete) return;

		const emptyCells = Grid.size - Grid.buttonCount;

		for (let i = 0; i < emptyCells; i++) {
			const $button = $(SoundButton.generateRandom(Grid.size + i - emptyCells));

			if (ButtonFilter.isFiltering) filterButton($button);

			Grid.$grid.append($button[0]);

			Grid.increaseSoundButtonCount();
		}
	}

	// TODO: update on window resize and on ui scale change
	private static updateButtonFontSize(): void {
		const $el = $($("#buttons-grid .soundbutton")[0]);

		const minFontSize = 10; /*parseInt($(document.body).css("font-size").toString());*/
		const maxFontSize = window.devicePixelRatio > 1 ? 24 : 16;

		let size =
			(Math.min($el.innerHeight(), $el.innerWidth()) -
				parseFloat($el.css("padding-top")) * 2) /
			2;

		size = EMath.clamp(size, minFontSize, maxFontSize);

		Grid.$grid.css("--button-font-size", size + "px");
	}
}
