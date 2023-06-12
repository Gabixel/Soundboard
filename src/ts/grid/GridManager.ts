/**
 * Container and management for sound buttons
 */
class GridManager extends Logger {
	private _$grid: JQuery<HTMLElement>;

	private _gridRows: number = 0;
	private _gridCols: number = 0;

	private soundButtonCount: number = 0;

	//#region Getters
	public get grid(): HTMLElement {
		return this._$grid[0];
	}

	public get $grid(): JQuery<HTMLElement> {
		return this._$grid;
	}

	public get rows(): number {
		return this._gridRows;
	}

	public get cols(): number {
		return this._gridCols;
	}

	public get size(): number {
		return this._gridRows * this._gridCols;
	}

	public get buttonCount(): number {
		return this.soundButtonCount;
	}

	public get isGridIncomplete(): boolean {
		return this.soundButtonCount < this.size;
	}

	public get $buttons(): JQuery<HTMLElement> {
		return this._$grid.children(".soundbutton");
	}

	public get buttons(): HTMLElement[] {
		return this._$grid.children(".soundbutton").toArray();
	}
	//#endregion

	constructor($grid: JQuery<HTMLElement>) {
		super();

		this._$grid = $grid;
		GridManager.logDebug(null, "Initialized!");
	}

	public setRows(newValue: number): void {
		this._gridRows = newValue;

		GridManager.logDebug(this.setRows, `Row size changed (${this._gridRows})`);
	}

	public setColumns(newValue: number): void {
		this._gridCols = newValue;

		GridManager.logDebug(
			this.setColumns,
			`Column size changed (${this._gridCols})`
		);
	}

	public resetSoundButtonCount(): void {
		this.soundButtonCount = 0;
	}

	public increaseSoundButtonCount(): void {
		this.soundButtonCount++;
	}

	public getButtonAtIndex(index: number): HTMLElement {
		if (this._$grid?.[0] == null) {
			throw new Error("Grid is not initialized");
		}

		const size = this.size;

		if (index >= size) {
			GridManager.logError(
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
