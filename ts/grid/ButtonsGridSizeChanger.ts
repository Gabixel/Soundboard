$("#grid-rows")
	.on("change", (e) => {
		updateRows(e);
		updateGrid();
	})
	.on("wheel", (e) => EventFunctions.updateInputFromWheel(e));

$("#grid-columns")
	.on("change", (e) => {
		updateColumns(e);
		updateGrid();
	})
	.on("wheel", (e) => EventFunctions.updateInputFromWheel(e));

$("#clear-grid").on("click", () => {
	$("#buttons-grid").empty();
	ButtonsGrid.resetButtonCount();
	fillEmptyCells();
});

function updateRows(e: JQuery.ChangeEvent) {
	const rows = parseInt($(e.target).val().toString());

	$("#buttons-grid").css({
		gridTemplateRows: `repeat(${rows}, 1fr)`,
	});

	ButtonsGrid.updateRows(rows);
}

function updateColumns(e: JQuery.ChangeEvent) {
	const columns = parseInt($(e.target).val().toString());

	$("#buttons-grid").css({
		gridTemplateColumns: `repeat(${columns}, 1fr)`,
	});

	ButtonsGrid.updateColumns(columns);
}

function updateGrid() {
	fillEmptyCells();
	updateVisibleButtons();
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

		if (index >= ButtonsGrid.size) {
			$(e).addClass("hidden");
		} else {
			$(e).removeClass("hidden");
		}
	});
}

function fillEmptyCells(): void {
	if (!ButtonsGrid.isGridIncomplete) return;

	const emptyCells = ButtonsGrid.size - ButtonsGrid.buttonCount;

	for (let i = 0; i < emptyCells; i++) {
		$("#buttons-grid").append(
			SoundButton.generateRandom(ButtonsGrid.buttonCount)
		);
		ButtonsGrid.increaseButtonCount();
	}
}
