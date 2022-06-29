let preparingDrag = false;
let isDragging = false;
let dragStartCoords = { x: 0, y: 0 };
let $lastTarget = null;
let $dragTarget = null;
let indexChanged = false;
let isStyled = false;
let dragFunction = mouseDrag_1;
$("#buttons-grid").on("mousemove", (e) => {
    if (e.which != 1)
        return;
    dragFunction(e);
});
$(document)
    .on("mousedown", ".soundbutton", (e) => {
    e.stopPropagation();
    if (e.which != 1)
        return;
    $dragTarget = $(e.target);
    indexChanged =
        $lastTarget == null ||
            $lastTarget.css("--index") !== $dragTarget.css("--index");
    $lastTarget = $dragTarget;
    dragStartCoords = { x: e.pageX, y: e.pageY };
    preparingDrag = true;
})
    .on("mouseup", (e) => {
    e.stopPropagation();
    isDragging = preparingDrag = false;
    const $dropTarget = getElementFromPoint(e.pageX, e.pageY);
    if ($dragTarget != null &&
        $dropTarget != null &&
        $dragTarget.css("--index") != $dropTarget.css("--index")) {
        swapButtons($dragTarget, $dropTarget);
    }
    if ($dragTarget != null && isStyled) {
        $dragTarget.removeClass("dragging");
        Grid.$grid.removeClass("has-dragging-child");
        $dragTarget.css("transform", "");
    }
    $dropTarget?.removeClass("drop-destination");
    clearOpacityDelay();
    $("#buttons-grid .soundbutton.hovered").removeClass("hovered");
    isStyled = false;
    $dragTarget = null;
    dragFunction = mouseDrag_1;
})
    .on("mouseenter", ".soundbutton", (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSoundButtonMouseEnter(e);
})
    .on("mouseleave", ".soundbutton", (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSoundButtonMouseLeave(e);
});
function mouseDrag_1(e) {
    if (!preparingDrag)
        return;
    let d = 0;
    if (!isDragging)
        d = Math.sqrt(Math.pow(e.pageX - dragStartCoords.x, 2) +
            Math.pow(e.pageY - dragStartCoords.y, 2));
    if (d <= 10)
        return;
    isDragging = true;
    dragFunction = mouseDrag_2;
}
function mouseDrag_2(e) {
    if (!isDragging)
        return;
    $dragTarget.css("transform", `translate(${(e.pageX - dragStartCoords.x) /
        parseFloat($("#ui-scale-slider").val().toString())}px, ${(e.pageY - dragStartCoords.y) /
        parseFloat($("#ui-scale-slider").val().toString())}px)`);
    if (!isStyled) {
        isStyled = true;
        $dragTarget.addClass("dragging");
        const rows = parseInt($("#grid-rows").val().toString());
        const cols = parseInt($("#grid-columns").val().toString());
        if (rows > 7 &&
            cols > 7 &&
            ($("#buttons-grid .soundbutton").length > 49 || indexChanged)) {
            const draggedButtonIndex = parseInt($dragTarget.css("--index"));
            setOpacityDelay(cols, draggedButtonIndex);
        }
        Grid.$grid.addClass("has-dragging-child");
    }
}
function setOpacityDelay(cols, draggedButtonIndex) {
    const multiplier = 0.05;
    const sumOffset = 2;
    $("#buttons-grid .soundbutton")
        .filter((_i, el) => {
        return !$(el).hasClass("dragging");
    })
        .each((_i, el) => {
        const $el = $(el);
        const index = parseInt($el.css("--index"));
        const row = Math.floor(index / cols);
        const col = index % cols;
        const x = Math.abs(row - Math.floor(draggedButtonIndex / cols));
        const y = Math.abs(col - (draggedButtonIndex % cols));
        const sum = x + y + sumOffset;
        const distance = (sum * multiplier) / 1.5;
        $el.css("--opacity-delay", distance + "s");
    });
}
function clearOpacityDelay() {
    $("#buttons-grid .soundbutton").css("--opacity-delay", "");
}
function onSoundButtonMouseEnter(e) {
    if (!isDragging)
        return;
    $(e.target).addClass("drop-destination").addClass("hovered");
}
function onSoundButtonMouseLeave(e) {
    if (!isDragging)
        return;
    $(e.target).removeClass("drop-destination");
}
function getElementFromPoint(x, y) {
    const $target = $(document.elementFromPoint(x, y));
    if ($target.hasClass("soundbutton"))
        return $target;
    else
        return null;
}
function swapButtons($drag, $drop) {
    const dropTargetIndex = parseInt($drop.css("--index"));
    const lastTargetIndex = parseInt($drag.css("--index"));
    $drop.attr("id", "sound_btn_" + lastTargetIndex);
    $drag.attr("id", "sound_btn_" + dropTargetIndex);
    $drop.attr("tabindex", lastTargetIndex);
    $drag.attr("tabindex", dropTargetIndex);
    $drop.css("--index", lastTargetIndex.toString());
    $drag.css("--index", dropTargetIndex.toString());
    Logger.log(null, swapButtons, `Swapped buttons "${$drag.children(".button-theme").text()}" and "${$drop
        .children(".button-theme")
        .text()}"`);
}
