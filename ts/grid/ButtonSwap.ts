// TODO: class for this

let preparingDrag = false;
let isDragging = false;

let dragStartCoords = { x: 0, y: 0 };
let $lastTarget: JQuery<HTMLElement> | null = null;
let $dragTarget: JQuery<HTMLElement> | null = null;
let indexChanged = false;
let isStyled = false;

let dragFunction = mouseDrag_1;

// TODO: Remove event listeners on mouseup and reassign them on mousedown.
// This should alleviate performance issues during window resizing.

$("#buttons-grid").on("mousemove", (e) => {
	if (e.which != 1) return; // If not left mouse button

	dragFunction(e);
});

$(document)
	.on("mousedown", ".soundbutton", (e) => {
		// e.preventDefault(); // Seems to break the arrows inside the number inputs.
		e.stopPropagation();
		if (e.which != 1) return;

		// Set the new drag target
		$dragTarget = $(e.target);

		// This is needed when trying to apply the opacity delay animation.
		indexChanged =
			$lastTarget == null ||
			$lastTarget.css("--index") !== $dragTarget.css("--index"); // Checks if the index is the same as the last one

		// Overwrite the last target
		$lastTarget = $dragTarget;

		// Set the drag start coordinates
		dragStartCoords = { x: e.pageX, y: e.pageY };

		// Prepare the drag
		preparingDrag = true;
	})
	.on("mouseup", (e) => {
		// e.preventDefault(); // Seems to break the arrows inside the number inputs.
		e.stopPropagation();
		isDragging = preparingDrag = false;

		const $dropTarget = getElementFromPoint(e.pageX, e.pageY);

		if (
			$dragTarget != null &&
			$dropTarget != null &&
			$dragTarget.css("--index") != $dropTarget.css("--index")
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

function mouseDrag_1(e: JQuery.MouseMoveEvent): void {
	// if ($("#buttons-grid").hasClass("filtering")) return; // TODO: wtf doesn't work.
	if (!preparingDrag) return;

	// Small delay to prevent the mouse to start dragging instantly
	let d = 0;
	if (!isDragging)
		d = Math.sqrt(
			Math.pow(e.pageX - dragStartCoords.x, 2) +
				Math.pow(e.pageY - dragStartCoords.y, 2)
		);

	if (d <= 10) return;

	isDragging = true;
	dragFunction = mouseDrag_2;
}

function mouseDrag_2(e: JQuery.MouseMoveEvent): void {
	if (!isDragging) return;

	// TODO: get the ui scale from a future class
	$dragTarget.css(
		"transform",
		`translate(${
			(e.pageX - dragStartCoords.x) /
			parseFloat($("#ui-scale-slider").val().toString())
		}px, ${
			(e.pageY - dragStartCoords.y) /
			parseFloat($("#ui-scale-slider").val().toString())
		}px)`
	);

	if (!isStyled) {
		isStyled = true;

		$dragTarget.addClass("dragging");

		const rows = parseInt($("#grid-rows").val().toString());
		const cols = parseInt($("#grid-columns").val().toString());

		if (
			rows > 7 &&
			cols > 7 &&
			($("#buttons-grid .soundbutton").length > 49 || indexChanged)
		) {
			const draggedButtonIndex = parseInt($dragTarget.css("--index"));
			setOpacityDelay(cols, draggedButtonIndex);
		}

		$("#buttons-grid").addClass("has-dragging-child");
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

	$(e.target).addClass("drop-destination").addClass("hovered");
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
	$drag: JQuery<HTMLElement>,
	$drop: JQuery<HTMLElement>
): void {
	const dropTargetIndex = parseInt($drop.css("--index"));
	const lastTargetIndex = parseInt($drag.css("--index"));

	$drop.attr("id", "sound_btn_" + lastTargetIndex);
	$drag.attr("id", "sound_btn_" + dropTargetIndex);

	$drop.attr("tabindex", lastTargetIndex);
	$drag.attr("tabindex", dropTargetIndex);

	$drop.css("--index", lastTargetIndex.toString());
	$drag.css("--index", dropTargetIndex.toString());

	Logger.log(
		null,
		swapButtons,
		`Swapped buttons "${$drag.children(".button-theme").text()}" and "${$drop
			.children(".button-theme")
			.text()}"`
	);
}
