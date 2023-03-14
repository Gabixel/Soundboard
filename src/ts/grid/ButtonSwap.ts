class ButtonSwap extends Logger {
	private _gridManager: GridManager;

	private isPreparingDrag = false;
	private _isDragging = false;

	private dragStartCoords = { x: 0, y: 0 };

	private $lastTarget: JQuery<HTMLElement> = null;
	private $currentTarget: JQuery<HTMLElement> = null;

	private isIndexChanged = false;
	private isStyleStarted = false;

	public get isDragging(): boolean {
		return this._isDragging;
	}

	private dragFunction: (e: JQuery.MouseMoveEvent) => void = null;

	constructor(gridManager: GridManager) {
		super();

		this._gridManager = gridManager;

		this.initMouseDown();
		this.initDocumentEvents();
		this.setMouseDrag_1();

		ButtonSwap.logInfo(null, "Initialized!");
	}

	private mouseDrag_1 = (e: JQuery.MouseMoveEvent): void => {
		if (!this.isPreparingDrag) return;

		// Small delay to prevent the mouse to start dragging instantly
		let delay = 0;
		if (!this._isDragging)
			delay = Math.sqrt(
				Math.pow(e.pageX - this.dragStartCoords.x, 2) +
					Math.pow(e.pageY - this.dragStartCoords.y, 2)
			);

		if (delay <= 10) return;

		this._isDragging = true;
		this.setMouseDrag_2();
	};

	private mouseDrag_2 = (e: JQuery.MouseMoveEvent): void => {
		if (!this._isDragging) return;

		let sliderValue = UiScale.getSliderValue();
		let movX = (e.pageX - this.dragStartCoords.x) / sliderValue;
		let movY = (e.pageY - this.dragStartCoords.y) / sliderValue;

		this.$currentTarget.css("transform", `translate(${movX}px, ${movY}px)`);

		if (!this.isStyleStarted) {
			this.isStyleStarted = true;

			this.$currentTarget.addClass("dragging");

			if (
				this._gridManager.rows >= 7 &&
				this._gridManager.cols >= 7 &&
				(this._gridManager.buttonCount >= 49 || this.isIndexChanged)
			) {
				const draggedButtonIndex = parseInt(this.$currentTarget.css("--index"));
				this.setOpacityDelay(this._gridManager.cols, draggedButtonIndex);
			}

			this._gridManager.$grid.addClass("has-dragging-child");
		}
	};

	private setMouseDrag_1(): void {
		this.dragFunction = this.mouseDrag_1;
	}
	private setMouseDrag_2(): void {
		this.dragFunction = this.mouseDrag_2;
	}

	private initMouseDown(): void {
		this._gridManager.$grid.on("mousemove", (e) => {
			// 1 is left mouse button
			if ((e.keyCode || e.which) !== 1) return;

			this.dragFunction(e);
		});
	}

	private initDocumentEvents() {
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
				this._isDragging = this.isPreparingDrag = false;

				const $dropTarget = ButtonSwap.getButtonFromPoint(e.pageX, e.pageY);

				if (
					this.$currentTarget != null &&
					$dropTarget != null &&
					this.$currentTarget.css("--index") != $dropTarget.css("--index")
				) {
					ButtonSwap.swapButtons(this.$currentTarget, $dropTarget);
				}

				// Remove properties to last target
				if (this.$currentTarget != null && this.isStyleStarted) {
					this.$currentTarget.removeClass("dragging");
					this._gridManager.$grid.removeClass("has-dragging-child");
					this.$currentTarget.css("transform", "");
				}

				$dropTarget?.removeClass("drop-destination");
				this.clearOpacityDelay();
				this._gridManager.$buttons.find(".hovered").removeClass("hovered");

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

	private setOpacityDelay(cols: number, draggedButtonIndex: number): void {
		const multiplier = 0.05;
		const sumOffset = 2;

		// Delay effect for the buttons around the dragged one
		this._gridManager.$buttons
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

	private clearOpacityDelay(): void {
		this._gridManager.$buttons.css("--opacity-delay", "");
	}

	private onSoundButtonMouseEnter(e: JQuery.MouseEnterEvent): void {
		if (!this._isDragging) return;

		$(e.target).addClass("drop-destination").addClass("hovered");
	}

	private onSoundButtonMouseLeave(e: JQuery.MouseLeaveEvent): void {
		if (!this._isDragging) return;

		$(e.target).removeClass("drop-destination");
	}

	private static swapButtons(
		$drag: JQuery<HTMLElement>,
		$drop: JQuery<HTMLElement>
	): void {
		const dropTargetIndex = parseInt($drop.css("--index"));
		const lastTargetIndex = parseInt($drag.css("--index"));

		// TODO: move to a function inside SoundButtonManager

		$drop.attr("id", "sound_btn_" + lastTargetIndex);
		$drag.attr("id", "sound_btn_" + dropTargetIndex);

		$drop.attr("tabindex", lastTargetIndex);
		$drag.attr("tabindex", dropTargetIndex);

		$drop.css("--index", lastTargetIndex.toString());
		$drag.css("--index", dropTargetIndex.toString());

		this.logDebug(
			this.swapButtons,
			`Swapped buttons "${$drag.children(".button-theme").text()}" and "${$drop
				.children(".button-theme")
				.text()}"`
		);
	}

	private static getButtonFromPoint(x: number, y: number): JQuery<HTMLElement> {
		const $target = $(UserInterface.elementFromPoint(x, y));

		if ($target.hasClass("soundbutton")) return $target as JQuery<HTMLElement>;
		else return null;
	}
}

// TODO: Remove event listeners on mouseup and reassign them on mousedown.
// This should alleviate performance issues during window resizing.
