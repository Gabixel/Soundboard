class GridResizer {
	private static grid: Grid;

	public static setGrid(grid: Grid): void {
		this.grid = grid;
	}

	private static setupResizeEvents(): void {}
}

// TODO: move all to class //////////////////////////////////////////////////////

let resizerStarted = false;

function initResizer() {
	$("#grid-rows, #grid-columns").trigger("change"); // Initializes grid
	resizerStarted = true;
	updateGrid();
}

$("#grid-rows")
	.on("change", (e) => {
		updateRows(e);
		if(resizerStarted) updateGrid();
	})
	.on("wheel", (e) => {
		EventFunctions.updateInputValueFromWheel(e);
	});
// .on("mouseup", (e) => {
// 	e.stopPropagation();
// });

$("#grid-columns")
	.on("change", (e) => {
		updateColumns(e);
		if (resizerStarted) updateGrid();
	})
	.on("wheel", (e) => {
		EventFunctions.updateInputValueFromWheel(e);
	});
// .on("mouseup", (e) => {
// 	e.stopPropagation();
// });

$("#clear-grid").on("click", () => {
	$("#buttons-grid").empty();
	Grid.resetSoundButtonCount();
	updateGrid();
});

function updateRows(e: JQuery.ChangeEvent) {
	const rows = parseInt($(e.target).val().toString());

	// $("#buttons-grid").css({
	// 	gridTemplateRows: `repeat(${rows}, 1fr)`,
	// });
	$("#buttons-grid").css("--rows", rows);

	Grid.setRows(rows);
}

function updateColumns(e: JQuery.ChangeEvent) {
	const columns = parseInt($(e.target).val().toString());

	// $("#buttons-grid").css({
	// 	gridTemplateColumns: `repeat(${columns}, 1fr)`,
	// });
	$("#buttons-grid").css("--columns", columns);

	Grid.setColumns(columns);
}

function updateGrid() {
	fillEmptyCells();

	updateVisibleButtons();
	updateButtonFontSize();
}

function updateVisibleButtons(): void {
	$(
		$("#buttons-grid .soundbutton")
			.toArray()
			.sort(function (a: HTMLElement, b: HTMLElement): number {
				const aIndex = parseInt($(a).css("--index").toString());
				const bIndex = parseInt($(b).css("--index").toString());
				return aIndex - bIndex;
			})
	).each((i: number, e: HTMLElement) => {
		const index = parseInt($(e).css("--index").toString());

		if (index >= Grid.size) {
			$(e).addClass("hidden");
		} else {
			$(e).removeClass("hidden");
		}
	});
}

function fillEmptyCells(): void {
	if (!Grid.isGridIncomplete) return;

	const emptyCells = Grid.size - Grid.buttonCount;

	for (let i = 0; i < emptyCells; i++) {
		const $button = $(SoundButton.generateRandom(Grid.size + i - emptyCells));

		if (ButtonFilter.isFiltering) filterButton($button);

		$("#buttons-grid").append($button[0]);

		Grid.increaseSoundButtonCount();
	}
}

// TODO: update on window resize and on ui scale change
function updateButtonFontSize(): void {
	const $el = $($("#buttons-grid .soundbutton")[0]);

	const minFontSize = 10; /*parseInt($(document.body).css("font-size").toString());*/
	const maxFontSize = window.devicePixelRatio > 1 ? 24 : 16;

	let size =
		(Math.min($el.innerHeight(), $el.innerWidth()) -
			parseFloat($el.css("padding-top")) * 2) /
		2;

	size = EMath.clamp(size, minFontSize, maxFontSize);

	$("#buttons-grid").css("--button-font-size", size + "px");
}
