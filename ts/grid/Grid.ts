class Grid {
	private static gridRows = 0;
	private static gridCols = 0;
	private static gridSize = 0;

	private static grid: JQuery<HTMLElement>;

	private static soundButtonCount = 0;

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
}
