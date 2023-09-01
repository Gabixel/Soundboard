class GridSoundButtonSwap {
	private static readonly DRAG_DELAY: number = 10;

	private _gridSoundButtonChildFactory: GridSoundButtonChildFactory;

	private _$parent: JQuery<HTMLElement>;

	private _dragState: ButtonDragState = "idle";

	private _dragData: {
		$draggedButton: SoundButtonElementJQuery;
		$destinationButton: SoundButtonElementJQuery;
		dragDelay: number;
		dragStartAxis: {
			x: number;
			y: number;
		};
	};

	constructor(
		gridSoundButtonChildFactory: GridSoundButtonChildFactory,
		$parent: JQuery<HTMLElement>
	) {
		this._gridSoundButtonChildFactory = gridSoundButtonChildFactory;

		this._$parent = $parent;

		this.resetDragData();

		this.initMouseEvents();
	}

	public cancelSwap(): void {
		this.resetDragData();
	}

	private resetDragData(): void {
		this._dragData = {
			$draggedButton: this._dragData?.$draggedButton,
			$destinationButton: null,
			dragDelay: 0,
			dragStartAxis: {
				x: -1,
				y: -1,
			},
		};

		this.setDraggingButtonOffset(null);
		this.setDraggingClasses(false);

		this._dragData.$draggedButton = null;

		this._dragState = "idle";
	}

	private dragUpdate(e: any): void {
		if (this._dragState == "preparing") {
			this.updatePreparing(e);
		} else if (this._dragState == "dragging") {
			this.updateDragging(e);
		}
	}

	private updatePreparing(e: JQuery.MouseMoveEvent): void {
		let delay = Math.sqrt(
			Math.pow(e.pageX - this._dragData.dragStartAxis.x, 2) +
				Math.pow(e.pageY - this._dragData.dragStartAxis.y, 2)
		);

		if (delay <= GridSoundButtonSwap.DRAG_DELAY) {
			return;
		}

		this.setDraggingClasses(true);

		this._dragState = "dragging";
	}

	private updateDragging(e: JQuery.MouseMoveEvent): void {
		let sliderValue = UiScale.getSliderValue();

		const startAxis = this._dragData.dragStartAxis;

		let offset = {
			x: (e.pageX - startAxis.x) / sliderValue,
			y: (e.pageY - startAxis.y) / sliderValue,
		};

		this.setDraggingButtonOffset(offset);
	}

	private initMouseEvents(): void {
		$(document)
			.on("mousedown", `.${SoundButtonDispatcher.SOUNDBUTTON_CLASS}`, (e) => {
				if (this._dragState != "idle") {
					return;
				}

				if (!EventFunctions.isLeftClick(e)) {
					return;
				}

				e.stopPropagation();

				this._dragData.$draggedButton = $(e.target);
				this._dragData.dragStartAxis = {
					x: e.pageX,
					y: e.pageY,
				};
				this._dragState = "preparing";
			})
			.on("mouseup", (e) => {
				if (this._dragState != "preparing" && this._dragState != "dragging") {
					return;
				}

				e.stopPropagation();

				if (!this._dragData.$draggedButton.is(this._dragData.$destinationButton)) {
					this._dragState = "dropping";

					this.trySwap();

					this._dragData.$draggedButton.trigger("focus");
				}

				this.resetDragData();
			});

		this._$parent.on("mousemove", (e) => {
			this.dragUpdate(e);
		});

		this.onButton("mouseenter", (e) => {
			if (this._dragState != "dragging") {
				return;
			}

			e.stopPropagation();

			this._$parent
				.find(`.${SoundButtonDispatcher.SOUNDBUTTON_CLASS}`)
				.attr("tabindex", -1)
				.removeClass("drop-destination");
			$(e.target).addClass("drop-destination");
		})
			.onButton("mouseleave", (e) => {
				$(e.target)
					.removeAttr("tabindex")
					.removeClass("drop-destination");
			})
			.onButton("mouseup", (e) => {
				let $target = $(e.target);

				if(!$target.hasClass("drop-destination")) {
					return;
				}

				this._dragData.$destinationButton = $target;
			});
	}

	private trySwap(): void {
		if (this._dragState != "dropping") {
			return;
		}

		if (!this._dragData.$draggedButton || !this._dragData.$destinationButton) {
			return;
		}

		Logger.logDebug(
			`Swapping buttons ${this._dragData.$draggedButton.attr(
				"id"
			)} and ${this._dragData.$destinationButton.attr("id")}`
		);

		this._gridSoundButtonChildFactory.swapSoundButtons(
			this._dragData.$draggedButton,
			this._dragData.$destinationButton
		);
	}

	private setDraggingButtonOffset(
		offset: { x: number; y: number } | null
	): void {
		if (!offset) {
			this._dragData.$draggedButton?.css("transform", "");
		} else {
			this._dragData.$draggedButton?.css(
				"transform",
				`translate(${offset.x}px, ${offset.y}px)`
			);
		}
	}

	private setDraggingClasses(set: boolean): void {
		this._dragData.$draggedButton?.toggleClass("dragging", set);

		this._$parent.toggleClass("has-dragging-child", set);
	}

	private onButton<TType extends string>(
		events: TType,
		handler:
			| JQuery.TypeEventHandler<HTMLElement, undefined, any, any, TType>
			| false
	): this {
		this._$parent.on(
			events,
			`.${SoundButtonDispatcher.SOUNDBUTTON_CLASS}`,
			handler
		);

		return this;
	}
}

type ButtonDragState = "idle" | "preparing" | "dragging" | "dropping";
