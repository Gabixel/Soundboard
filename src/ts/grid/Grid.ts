abstract class Grid extends Logger {
	private static _gridRows: number = 0;
	private static _gridCols: number = 0;

	private static _$grid: JQuery<HTMLElement>;

	private static soundButtonCount: number = 0;

	private static _isFiltering: boolean = false;

	//#region Getters
	public static get grid(): HTMLElement {
		return this._$grid?.[0];
	}

	public static get $grid(): JQuery<HTMLElement> {
		return this._$grid;
	}

	public static get rows(): number {
		return this._gridRows;
	}

	public static get cols(): number {
		return this._gridCols;
	}

	public static get size(): number {
		return this._gridRows * this._gridCols;
	}

	public static get buttonCount(): number {
		return this.soundButtonCount;
	}

	public static get isGridIncomplete(): boolean {
		return this.soundButtonCount < this.size;
	}

	public static get isFiltering(): boolean {
		return this._isFiltering;
	}

	public static get $buttons(): JQuery<HTMLElement> {
		return this._$grid.children(".soundbutton");
	}

	public static get buttons(): HTMLElement[] {
		return this._$grid.children(".soundbutton").toArray();
	}
	//#endregion

	public static initGrid($container: JQuery<HTMLElement>): void {
		this._$grid = $container;
		this.logInfo(this.initGrid, "Initialized!");
	}

	public static setRows(newValue: number): void {
		this._gridRows = newValue;

		this.logDebug(this.setRows, `Row size changed (${this._gridRows})`);
	}

	public static setColumns(newValue: number): void {
		this._gridCols = newValue;

		this.logDebug(this.setColumns, `Column size changed (${this._gridCols})`);
	}

	public static resetSoundButtonCount(): void {
		this.soundButtonCount = 0;
	}

	public static increaseSoundButtonCount(): void {
		this.soundButtonCount++;
	}

	public static set isFiltering(value: boolean) {
		this._isFiltering = value;
	}

	public static getButtonAtIndex(index: number): HTMLElement {
		if (this._$grid?.[0] == null) {
			throw new Error("Grid is not initialized");
		}

		const size = this.size;

		if (index >= size) {
			this.logError(
				this.getButtonAtIndex,
				`Index '${index}' is out of bounds. Current max index: (${size} - 1 = ${
					size - 1
				})`
			);

			return null;
		}

		const $btn = this.buttons.filter((e) => {
			const i: string = $(e).css("--index");
			return i != null && i === index.toString();
		});

		if ($btn.length > 0) return $btn[0];
		else return null;
	}
}
