class Grid {
	private static gridRows: number = 0;
	private static gridCols: number = 0;
	private static gridSize: number = 0;

	private static grid: JQuery<HTMLElement>;

	private static soundButtonCount: number = 0;

	private static filtering: boolean = false;

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

	public static resetSoundButtonCount(): void {
		this.soundButtonCount = 0;
	}

	public static increaseSoundButtonCount(): void {
		this.soundButtonCount++;
	}

	public static get isGridIncomplete(): boolean {
		return this.soundButtonCount < this.size;
	}

	public static get isFiltering(): boolean {
		return this.filtering;
	}

	public static set isFiltering(value: boolean) {
		this.filtering = value;
	}
}
