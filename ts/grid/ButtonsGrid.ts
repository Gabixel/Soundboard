class ButtonsGrid {
	private static gridRows = 1;
	private static gridCols = 1;
	private static gridSize = 1;

	private static btnCount = 0;

	public static updateRows(newValue: number): void {
		this.gridRows = newValue;
		this.updateSize();
	}

	public static updateColumns(newValue: number): void {
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
		return this.btnCount;
	}

	public static resetButtonCount(): void {
		this.btnCount = 0;
	}

	public static increaseButtonCount(): void {
		this.btnCount++;
	}

	public static get isGridIncomplete(): boolean {
		return this.btnCount < this.size;
	}
}
