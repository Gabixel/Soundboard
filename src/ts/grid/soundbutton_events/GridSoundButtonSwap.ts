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
		// TODO

		this.resetDragData();
	}

	private resetDragData(): void {
		this._dragState = "idle";

		this._dragData = {
			$draggedButton: null,
			$destinationButton: null,
			dragDelay: 0,
			dragStartAxis: {
				x: -1,
				y: -1,
			},
		};

		this.setDraggingButtonOffset(null);
	}

	private dragUpdate(e: any): void {
		if (this._dragState == "preparing") {
			console.log("dragUpdate > updatePreparing");
			this.updatePreparing(e);
		} else if (this._dragState == "dragging") {
			console.log("dragUpdate > updateDragging");
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

				e.stopPropagation();

				if (!EventFunctions.isLeftClick(e)) {
					return;
				}

				console.log("preparing with mousedown");

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

				this._dragState = "dropping";

				this.trySwap();

				this.resetDragData();
			});

		this.on("mousemove", (e) => {
			this.dragUpdate(e);
		}).on("mouseenter", (e) => {
			if (this._dragState != "dragging") {
				return;
			}

			e.stopPropagation();

			this._$parent
				.find(`.${SoundButtonDispatcher.SOUNDBUTTON_CLASS}`)
				.removeClass("drop-destination")
				.removeClass("hovered");
			$(e.target).addClass("drop-destination").addClass("hovered");
		});
	}

	private trySwap(): void {
		if (this._dragState != "dropping") {
			return;
		}

		console.log("trySwap");
	}

	private setDraggingButtonOffset(
		offset: { x: number; y: number } | null
	): void {
		if (!this._dragData.$draggedButton) {
			return;
		}

		if (!offset) {
			this._dragData.$draggedButton.css("transform", "");
		} else {
			this._dragData.$draggedButton.css(
				"transform",
				`translate(${offset.x}px, ${offset.y}px)`
			);
		}
	}

	private on<TType extends string>(
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
