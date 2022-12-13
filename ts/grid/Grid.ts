abstract class Grid {
	private static gridRows: number = 0;
	private static gridCols: number = 0;
	private static gridSize: number = 0;

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
		return this.gridRows;
	}

	public static get cols(): number {
		return this.gridCols;
	}

	public static get size(): number {
		return this.gridSize;
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
	}

	public static setRows(newValue: number): void {
		this.gridRows = newValue;
		this.updateSize();
	}

	public static setColumns(newValue: number): void {
		this.gridCols = newValue;
		this.updateSize();
	}

	private static updateSize(): void {
		this.gridSize = this.gridRows * this.gridCols;
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

	// TODO: store buttons in an array
	public static getButtonAtIndex(index: number): HTMLElement {
		if (this._$grid?.[0] == null) {
			throw new Error("Grid is not initialized");
		}

		if (index >= this.gridSize) {
			Logger.logError(
				this.name,
				this.getButtonAtIndex,
				`Index '${index}' is out of bounds. Current max index: (${
					this.gridSize
				} - 1 = ${this.gridSize - 1})`
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

	public static getEmptyIndexes(): number[] {
		const indexes: number[] = [] as number[];

		for (let i = 0; i < this.gridSize; i++) {
			if (this.isCellEmpty(i)) indexes.push(i);
		}

		return indexes;
	}

	public static isCellEmpty(index: number): boolean {
		console.log(this.$buttons.css("--index"));
		return true;
	}
}
