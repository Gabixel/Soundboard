abstract class ButtonSwap extends Logger {
	private static isPreparingDrag = false;
	private static isDragging = false;

	private static dragStartCoords = { x: 0, y: 0 };

	private static $lastTarget: JQuery<HTMLElement> = null;
	private static $currentTarget: JQuery<HTMLElement> = null;

	private static isIndexChanged = false;
	private static isStyleStarted = false;

	private static dragFunction: (e: JQuery.MouseMoveEvent) => void = null;

	public static initialize(): void {
		this.initMouseDown();
		this.initDocumentEvents();
		this.setMouseDrag_1();

		this.logInfo(this.initialize, "Initialized!");
	}

	private static mouseDrag_1 = (e: JQuery.MouseMoveEvent): void => {
		if (!this.isPreparingDrag) return;

		// Small delay to prevent the mouse to start dragging instantly
		let delay = 0;
		if (!this.isDragging)
			delay = Math.sqrt(
				Math.pow(e.pageX - this.dragStartCoords.x, 2) +
					Math.pow(e.pageY - this.dragStartCoords.y, 2)
			);

		if (delay <= 10) return;

		this.isDragging = true;
		this.setMouseDrag_2();
	};

	private static mouseDrag_2 = (e: JQuery.MouseMoveEvent): void => {
		if (!this.isDragging) return;

		let sliderValue = UiScale.getSliderValue();
		let movX = (e.pageX - this.dragStartCoords.x) / sliderValue;
		let movY = (e.pageY - this.dragStartCoords.y) / sliderValue;

		this.$currentTarget.css("transform", `translate(${movX}px, ${movY}px)`);

		if (!this.isStyleStarted) {
			this.isStyleStarted = true;

			this.$currentTarget.addClass("dragging");

			const rows = parseInt($("#grid-rows").val().toString());
			const cols = parseInt($("#grid-columns").val().toString());

			if (
				rows > 7 &&
				cols > 7 &&
				($("#buttons-grid .soundbutton").length > 49 || this.isIndexChanged)
			) {
				const draggedButtonIndex = parseInt(this.$currentTarget.css("--index"));
				this.setOpacityDelay(cols, draggedButtonIndex);
			}

			Grid.$grid.addClass("has-dragging-child");
		}
	};

	private static setMouseDrag_1(): void {
		this.dragFunction = this.mouseDrag_1;
	}
	private static setMouseDrag_2(): void {
		this.dragFunction = this.mouseDrag_2;
	}

	private static initMouseDown(): void {
		Grid.$grid.on("mousemove", (e) => {
			// 1 is left mouse button
			if ((e.keyCode || e.which) !== 1) return;

			this.dragFunction(e);
		});
	}

	private static initDocumentEvents() {
		$(document)
			.on("mousedown", ".soundbutton", (e) => {
				// e.preventDefault(); // Seems to break the arrows inside the number inputs.
				e.stopPropagation();
				if ((e.keyCode || e.which) !== 1) return;

				// Set the new drag target
				this.$currentTarget = $(e.target);

				// This is needed when trying to apply the opacity delay animation.
				this.isIndexChanged =
					this.$lastTarget == null ||
					this.$lastTarget.css("--index") !== this.$currentTarget.css("--index"); // Checks if the index is the same as the last one

				// Overwrite the last target
				this.$lastTarget = this.$currentTarget;

				// Set the drag start coordinates
				this.dragStartCoords = { x: e.pageX, y: e.pageY };

				// Prepare the drag
				this.isPreparingDrag = true;
			})
			.on("mouseup", (e) => {
				// e.preventDefault(); // Seems to break the arrows inside the number inputs.
				e.stopPropagation();
				this.isDragging = this.isPreparingDrag = false;

				const $dropTarget = this.getButtonFromPoint(e.pageX, e.pageY);

				if (
					this.$currentTarget != null &&
					$dropTarget != null &&
					this.$currentTarget.css("--index") != $dropTarget.css("--index")
				) {
					this.swapButtons(this.$currentTarget, $dropTarget);
				}

				// Remove properties to last target
				if (this.$currentTarget != null && this.isStyleStarted) {
					this.$currentTarget.removeClass("dragging");
					Grid.$grid.removeClass("has-dragging-child");
					this.$currentTarget.css("transform", "");
				}

				$dropTarget?.removeClass("drop-destination");
				this.clearOpacityDelay();
				$("#buttons-grid .soundbutton.hovered").removeClass("hovered");

				this.isStyleStarted = false;
				this.$currentTarget = null;
				this.setMouseDrag_1();
			})
			.on("mouseenter", ".soundbutton", (e) => {
				e.preventDefault();
				e.stopPropagation();
				this.onSoundButtonMouseEnter(e);
			})
			.on("mouseleave", ".soundbutton", (e) => {
				e.preventDefault();
				e.stopPropagation();
				this.onSoundButtonMouseLeave(e);
			});
	}

	private static setOpacityDelay(
		cols: number,
		draggedButtonIndex: number
	): void {
		const multiplier = 0.05;
		const sumOffset = 2;

		// Delay effect for the buttons around the dragged one
		Grid.$buttons
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

	private static clearOpacityDelay(): void {
		$("#buttons-grid .soundbutton").css("--opacity-delay", "");
	}

	private static onSoundButtonMouseEnter(e: JQuery.MouseEnterEvent): void {
		if (!this.isDragging) return;

		$(e.target).addClass("drop-destination").addClass("hovered");
	}

	private static onSoundButtonMouseLeave(e: JQuery.MouseLeaveEvent): void {
		if (!this.isDragging) return;

		$(e.target).removeClass("drop-destination");
	}

	private static getButtonFromPoint(x: number, y: number): JQuery<HTMLElement> {
		const $target = $(Interface.elementFromPoint(x, y));

		if ($target.hasClass("soundbutton")) return $target as JQuery<HTMLElement>;
		else return null;
	}

	private static swapButtons(
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

		Logger.logDebug(
			this.swapButtons,
			`Swapped buttons "${$drag.children(".button-theme").text()}" and "${$drop
				.children(".button-theme")
				.text()}"`
		);
	}
}

// TODO: Remove event listeners on mouseup and reassign them on mousedown.
// This should alleviate performance issues during window resizing.
