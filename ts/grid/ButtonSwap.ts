let preparingDrag = false;
let isDragging = false;

let dragStartCoords = { x: 0, y: 0 };
let $lastTarget: JQuery<HTMLElement> | null = null;
let indexChanged = false;
let isStyled = false;

$("#buttons-grid").on("mousemove", (e) => {
	if (e.which != 1) return;

	onButtonsGridMouseDrag(e);
});

$(document)
	.on("mousedown", ".soundbutton", (e) => {
		if (e.which != 1) return;

		const $newTarget = $(e.target);

		indexChanged =
			$lastTarget == null ||
			$newTarget.css("--index") !== $lastTarget.css("--index");

		console.log("index changed: " + indexChanged);
		$lastTarget = $newTarget;

		dragStartCoords = { x: e.pageX, y: e.pageY };

		preparingDrag = true;
	})
	.on("mouseup", (e) => {
		isDragging = preparingDrag = false;

		const $dropTarget = getElementFromPoint(e.pageX, e.pageY);

		if (
			$lastTarget != $dropTarget &&
			$lastTarget != null &&
			$dropTarget != null
		) {
			swapButtons($lastTarget, $dropTarget);
		}

		// Remove properties to last target
		if ($lastTarget != null && isStyled) {
			$lastTarget.removeClass("dragging");
			$("#buttons-grid").removeClass("has-dragging-child");
			$lastTarget.css("transform", "");
		}

		$dropTarget?.removeClass("drop-destination");
		clearOpacityDelay();
		isStyled = false;
		// $lastTarget = null;
	})
	.on("mouseenter", ".soundbutton", (e) => {
		onSoundButtonMouseEnter(e);
	})
	.on("mouseleave", ".soundbutton", (e) => {
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

		$lastTarget.css(
			"transform",
			`translate(${e.pageX - dragStartCoords.x}px, ${
				e.pageY - dragStartCoords.y
			}px)`
		);

		if (!isStyled) {
			isStyled = true;

			$lastTarget.addClass("dragging");

			const rows = parseInt($("#grid-rows").val().toString());
			const cols = parseInt($("#grid-columns").val().toString());

			if (
				rows > 4 &&
				cols > 4 &&
				($("#buttons-grid .soundbutton").length > 16 || indexChanged)
			) {
				setOpacityDelay(cols, rows);
			}

			$("#buttons-grid").addClass("has-dragging-child");
		}
	}
}

function setOpacityDelay(cols: number, rows: number): void {
	const btnDragIndex = parseInt($lastTarget.css("--index"));

	const multiplier = 0.05;

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

			const x = Math.abs(row - Math.floor(btnDragIndex / cols));
			const y = Math.abs(col - (btnDragIndex % cols));
			const sum = x + y;
			const distance = (sum * multiplier) / 2;

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
