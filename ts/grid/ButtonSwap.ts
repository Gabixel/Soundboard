let preparingDrag = false;
let isDragging = false;

let dragStartCoords = { x: 0, y: 0 };
let $lastTarget: JQuery<HTMLElement> | null = null;
let $dragTarget: JQuery<HTMLElement> | null = null;
let indexChanged = false;
let isStyled = false;

// TODO: remove event listeners on mouseup and reassign them on mousedown

$("#buttons-grid").on("mousemove", (e) => {
	if (e.which != 1) return;

	onButtonsGridMouseDrag(e);
});

$(document)
	.on("mousedown", ".soundbutton", (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.which != 1) return;

		// Set the drag target
		$dragTarget = $(e.target);

		// This is needed when trying to apply the opacity delay animation.
		indexChanged =
			$lastTarget == null ||
			$lastTarget.css("--index") !== $dragTarget.css("--index"); // Check if the index is the same as the last one

		// Overwrite the last target
		$lastTarget = $dragTarget;

		// Set the drag start coordinates
		dragStartCoords = { x: e.pageX, y: e.pageY };

		// Prepare the drag
		preparingDrag = true;
	})
	.on("mouseup", (e) => {
		e.preventDefault();
		e.stopPropagation();
		isDragging = preparingDrag = false;

		const $dropTarget = getElementFromPoint(e.pageX, e.pageY);

		if (
			$dragTarget != $dropTarget &&
			$dragTarget != null &&
			$dropTarget != null
		) {
			swapButtons($dragTarget, $dropTarget);
		}

		// Remove properties to last target
		if ($dragTarget != null && isStyled) {
			$dragTarget.removeClass("dragging");
			$("#buttons-grid").removeClass("has-dragging-child");
			$dragTarget.css("transform", "");
		}

		$dropTarget?.removeClass("drop-destination");
		clearOpacityDelay();
		isStyled = false;
		$dragTarget = null;
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

function onButtonsGridMouseDrag(e: JQuery.MouseMoveEvent): void {
	if (!preparingDrag) return;

	// Small delay to prevent the mouse to start dragging instantly
	let d = 0;
	if (!isDragging)
		d = Math.sqrt(
			Math.pow(e.pageX - dragStartCoords.x, 2) +
				Math.pow(e.pageY - dragStartCoords.y, 2)
		);

	if (isDragging || d > 10) {
		isDragging = true;

		$dragTarget.css(
			"transform",
			`translate(${e.pageX - dragStartCoords.x}px, ${
				e.pageY - dragStartCoords.y
			}px)`
		);

		if (!isStyled) {
			isStyled = true;

			$dragTarget.addClass("dragging");

			const rows = parseInt($("#grid-rows").val().toString());
			const cols = parseInt($("#grid-columns").val().toString());

			const draggedButtonIndex = parseInt($dragTarget.css("--index"));
			const dragButtonRow = Math.floor(draggedButtonIndex / cols);
			const dragButtonCol = draggedButtonIndex % cols;

			const maxPossibleDistance = Math.max(
				dragButtonCol,
				Math.abs(dragButtonCol - cols),
				dragButtonRow,
				Math.abs(dragButtonRow - rows)
			);

			if (
				maxPossibleDistance > 3 &&
				rows > 4 &&
				rows < 11 &&
				cols > 4 &&
				rows < 11 &&
				($("#buttons-grid .soundbutton").length > 16 || indexChanged)
			) {
				setOpacityDelay(cols, draggedButtonIndex);
			}

			$("#buttons-grid").addClass("has-dragging-child");
		}
	}
}

function setOpacityDelay(cols: number, draggedButtonIndex: number): void {
	const multiplier = 0.05;
	const sumOffset = 2;

	// Delay effect for the buttons around the dragged one
	$("#buttons-grid .soundbutton")
		.filter((_i, el) => {
			return !$(el).hasClass("dragging") /* && !$(el).hasClass("hidden")*/;
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

function clearOpacityDelay(): void {
	$("#buttons-grid .soundbutton").css("--opacity-delay", "");
}

function onSoundButtonMouseEnter(e: JQuery.MouseEnterEvent): void {
	if (!isDragging) return;

	$(e.target).addClass("drop-destination");
}

function onSoundButtonMouseLeave(e: JQuery.MouseLeaveEvent): void {
	if (!isDragging) return;

	$(e.target).removeClass("drop-destination");
}

function getElementFromPoint(x: number, y: number): JQuery<HTMLElement> | null {
	const $target = $(document.elementFromPoint(x, y));

	if ($target.hasClass("soundbutton")) return $target as JQuery<HTMLElement>;
	else return null;
}

function swapButtons(
	$lastTarget: JQuery<HTMLElement>,
	$dropTarget: JQuery<HTMLElement>
): void {
	const dropTargetIndex = parseInt($dropTarget.css("--index"));
	const lastTargetIndex = parseInt($lastTarget.css("--index"));

	$dropTarget.attr("id", "sound_btn_" + lastTargetIndex);
	$lastTarget.attr("id", "sound_btn_" + dropTargetIndex);

	$dropTarget.attr("tabindex", lastTargetIndex);
	$lastTarget.attr("tabindex", dropTargetIndex);

	$dropTarget.css("--index", lastTargetIndex.toString());
	$lastTarget.css("--index", dropTargetIndex.toString());
}
