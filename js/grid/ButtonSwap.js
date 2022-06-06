let preparingDrag = false;
let isDragging = false;
let dragStartCoords = { x: 0, y: 0 };
let $lastTarget = null;
let targetChanged = false;
let isStyled = false;
$("#buttons-grid").on("mousemove", (e) => {
    if (e.which != 1)
        return;
    onButtonsGridMouseDrag(e);
});
$(document)
    .on("mousedown", ".soundbutton", (e) => {
    if (e.which != 1)
        return;
    preparingDrag = true;
    $lastTarget = $(e.target);
    dragStartCoords = { x: e.pageX, y: e.pageY };
})
    .on("mouseup", (e) => {
    isDragging = preparingDrag = false;
    const $dropTarget = getElementFromPoint(e.pageX, e.pageY);
    if ($lastTarget != $dropTarget &&
        $lastTarget != null &&
        $dropTarget != null) {
        swapButtons($lastTarget, $dropTarget);
    }
    if ($lastTarget != null && isStyled) {
        $lastTarget.removeClass("dragging");
        $("#buttons-grid").removeClass("has-dragging-child");
        $lastTarget.css("transform", "");
    }
    $dropTarget?.removeClass("drop-destination");
    isStyled = false;
    $lastTarget = null;
})
    .on("mouseenter", ".soundbutton", (e) => {
    onSoundButtonMouseEnter(e);
})
    .on("mouseleave", ".soundbutton", (e) => {
    onSoundButtonMouseLeave(e);
});
function onButtonsGridMouseDrag(e) {
    if (!preparingDrag)
        return;
    let d = 0;
    if (!isDragging)
        d = Math.sqrt(Math.pow(e.pageX - dragStartCoords.x, 2) +
            Math.pow(e.pageY - dragStartCoords.y, 2));
    if (isDragging || d > 10) {
        isDragging = true;
        $lastTarget.css("transform", `translate(${e.pageX - dragStartCoords.x}px, ${e.pageY - dragStartCoords.y}px)`);
        if (!isStyled) {
            isStyled = true;
            $lastTarget.addClass("dragging");
            $lastTarget.parent().addClass("has-dragging-child");
        }
    }
}
function onSoundButtonMouseEnter(e) {
    if (!isDragging)
        return;
    $(e.target).addClass("drop-destination");
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
function swapButtons($lastTarget, $dropTarget) {
    const dropTargetIndex = parseInt($dropTarget.css("--index"));
    const lastTargetIndex = parseInt($lastTarget.css("--index"));
    $dropTarget.attr("id", lastTargetIndex);
    $lastTarget.attr("id", dropTargetIndex);
    $dropTarget.attr("tabindex", lastTargetIndex);
    $lastTarget.attr("tabindex", dropTargetIndex);
    $dropTarget.css("--index", lastTargetIndex.toString());
    $lastTarget.css("--index", dropTargetIndex.toString());
}
