$("#grid-rows")
    .on("change", (e) => {
    updateRows(e);
    updateGrid();
})
    .on("wheel", (e) => {
    e.preventDefault();
    EventFunctions.updateInputValueFromWheel(e);
});
$("#grid-columns")
    .on("change", (e) => {
    updateColumns(e);
    updateGrid();
})
    .on("wheel", (e) => {
    e.preventDefault();
    EventFunctions.updateInputValueFromWheel(e);
});
$("#clear-grid").on("click", () => {
    $("#buttons-grid").empty();
    ButtonsGrid.resetButtonCount();
    fillEmptyCells();
});
function updateRows(e) {
    const rows = parseInt($(e.target).val().toString());
    $("#buttons-grid").css({
        gridTemplateRows: `repeat(${rows}, 1fr)`,
    });
    ButtonsGrid.updateRows(rows);
}
function updateColumns(e) {
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
function updateVisibleButtons() {
    $($("#buttons-grid .soundbutton")
        .toArray()
        .sort(function (a, b) {
        const aIndex = parseInt($(a).css("--index").toString());
        const bIndex = parseInt($(b).css("--index").toString());
        return aIndex - bIndex;
    })).each((i, e) => {
        const index = parseInt($(e).css("--index").toString());
        if (index >= ButtonsGrid.size) {
            $(e).addClass("hidden");
        }
        else {
            $(e).removeClass("hidden");
        }
    });
}
function fillEmptyCells() {
    if (!ButtonsGrid.isGridIncomplete)
        return;
    const emptyCells = ButtonsGrid.size - ButtonsGrid.buttonCount;
    for (let i = 0; i < emptyCells; i++) {
        $("#buttons-grid").append(SoundButton.generateRandom(ButtonsGrid.buttonCount));
        ButtonsGrid.increaseButtonCount();
    }
}
