class GridSoundButtonSwap {
	private _soundButtonDispatcher: SoundButtonDispatcher;

	private _soundButton1: SoundButtonElementJQuery;
	private _soundButton2: SoundButtonElementJQuery;

	private _dragState: buttonDragState = "idle";

	constructor(
		soundButtonDispatcher: SoundButtonDispatcher,
		$parent: JQuery<HTMLElement>,
		childClass: string
	) {
		this._soundButtonDispatcher = soundButtonDispatcher;

		this.initMouseDownEvent($parent, childClass);
	}

	public cancelSwap(): void {
		// TODO
	}

	private initMouseDownEvent($parent: JQuery<HTMLElement>, childClass: string) {
		$parent.on("mousedown", `.${childClass}`, (e) => {
			e.stopPropagation();
			const isLeftClick = e.button === 0;

			if (!isLeftClick) {
				return;
			}

			this._soundButton1 = $(e.target);
			this._dragState = "starting";
		});
	}
}

type buttonDragState = "idle" | "starting" | "dragging";
