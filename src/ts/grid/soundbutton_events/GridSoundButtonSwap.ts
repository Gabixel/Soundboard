class GridSoundButtonSwap {
	private static readonly DRAG_DELAY: number = 10;

	private _soundButtonDispatcher: SoundButtonDispatcher;

	private _$parent: JQuery<HTMLElement>;

	private _dragState: ButtonDragState = "idle";

	private _dragData: {
		$button1: SoundButtonElementJQuery;
		$button2: SoundButtonElementJQuery;
		dragDelay: number;
		dragStartAxis: {
			x: number;
			y: number;
		};
	};

	private dragUpdate(): void {}

	private dargUpdate1 = (e: JQuery.MouseMoveEvent): void => {
		if (this._dragState != "preparing") {
			return;
		}

		let delay = Math.sqrt(
			Math.pow(e.pageX - this._dragData.dragStartAxis.x, 2) +
				Math.pow(e.pageY - this._dragData.dragStartAxis.y, 2)
		);

		if (delay <= GridSoundButtonSwap.DRAG_DELAY) {
			return;
		}

		this._dragState = "dragging";
	};

	constructor(
		soundButtonDispatcher: SoundButtonDispatcher,
		$parent: JQuery<HTMLElement>
	) {
		this._soundButtonDispatcher = soundButtonDispatcher;

		this._$parent = $parent;

		this.resetDragData();

		this.initMouseEvents();
	}

	public cancelSwap(): void {
		// TODO

		this.resetDragData();
	}

	private resetDragData(): void {
		this._dragData = {
			$button1: null,
			$button2: null,
			dragDelay: 0,
			dragStartAxis: {
				x: -1,
				y: -1,
			},
		};
	}

	private initMouseEvents(): void {
		this._$parent.on(
			"mousedown",
			`.${SoundButtonDispatcher.SOUNDBUTTON_CLASS}`,
			(e) => {
				e.stopPropagation();

				if (!EventFunctions.isLeftClick(e)) {
					return;
				}

				this._dragData.$button1 = $(e.target);
				this._dragState = "preparing";
			}
		);
	}

	private setDragState(state: ButtonDragState): void {
		this._dragState = state;
	}
}

type ButtonDragState = "idle" | "preparing" | "dragging";
