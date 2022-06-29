class GridResizer {
    static grid;
    static setGrid(grid) {
        this.grid = grid;
    }
    static setupResizeEvents() { }
}
let resizerStarted = false;
function initResizer() {
    $("#grid-rows, #grid-columns").trigger("change");
    resizerStarted = true;
    updateGrid();
}
$("#grid-rows")
    .on("change", (e) => {
    updateRows(e);
    if (resizerStarted)
        updateGrid();
})
    .on("wheel", (e) => {
    EventFunctions.updateInputValueFromWheel(e);
});
$("#grid-columns")
    .on("change", (e) => {
    updateColumns(e);
    if (resizerStarted)
        updateGrid();
})
    .on("wheel", (e) => {
    EventFunctions.updateInputValueFromWheel(e);
});
$("#clear-grid").on("click", () => {
    Grid.$grid.empty();
    Grid.resetSoundButtonCount();
    updateGrid();
});
function updateRows(e) {
    const rows = parseInt($(e.target).val().toString());
    Grid.$grid.css("--rows", rows);
    Grid.setRows(rows);
}
function updateColumns(e) {
    const columns = parseInt($(e.target).val().toString());
    Grid.$grid.css("--columns", columns);
    Grid.setColumns(columns);
}
function updateGrid() {
    fillEmptyCells();
    updateVisibleButtons();
    updateButtonFontSize();
}
function updateVisibleButtons() {
    $($("#buttons-grid .soundbutton")
        .toArray()
        .sort(function (a, b) {
        const aIndex = parseInt($(a).css("--index").toString());
        const bIndex = parseInt($(b).css("--index").toString());
        return aIndex - bIndex;
    })).each((i, e) => {
        const index = parseInt($(e).css("--index").toString());
        if (index >= Grid.size) {
            $(e).addClass("hidden");
        }
        else {
            $(e).removeClass("hidden");
        }
    });
}
function fillEmptyCells() {
    if (!Grid.isGridIncomplete)
        return;
    const emptyCells = Grid.size - Grid.buttonCount;
    for (let i = 0; i < emptyCells; i++) {
        const $button = $(SoundButton.generateRandom(Grid.size + i - emptyCells));
        if (ButtonFilter.isFiltering)
            filterButton($button);
        Grid.$grid.append($button[0]);
        Grid.increaseSoundButtonCount();
    }
}
function updateButtonFontSize() {
    const $el = $($("#buttons-grid .soundbutton")[0]);
    const minFontSize = 10;
    const maxFontSize = window.devicePixelRatio > 1 ? 24 : 16;
    let size = (Math.min($el.innerHeight(), $el.innerWidth()) -
        parseFloat($el.css("padding-top")) * 2) /
        2;
    size = EMath.clamp(size, minFontSize, maxFontSize);
    Grid.$grid.css("--button-font-size", size + "px");
}
