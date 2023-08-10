class GridResizer extends EventTarget {
	private _rowCount: number;
	private _columnCount: number;

	private _$rowsInput: JQuery<HTMLInputElement>;
	private _$columnsInput: JQuery<HTMLInputElement>;

	private _resizingRow: Semaphore = new Semaphore();
	private _resizingColumn: Semaphore = new Semaphore();
	private get _isResizing(): boolean {
		return this._resizingRow.isLocked || this._resizingColumn.isLocked;
	}

	constructor(
		$rowsInput: JQuery<HTMLInputElement>,
		$columnsInput: JQuery<HTMLInputElement>,
		rowCount: number = 3,
		columnCount: number = 7
	) {
		super();

		this._rowCount = rowCount;
		this._columnCount = columnCount;

		this._$rowsInput = $rowsInput.val(rowCount);
		this._$columnsInput = $columnsInput.val(columnCount);

		this.initInputEvents();
	}

	private initInputEvents(): void {
		this._$rowsInput
			.add(this._$columnsInput)
			.on("wheel", (e) => {
				// Prevent base scrolling behavior (if chromium triggers it)
				e.stopImmediatePropagation();

				// UI Scale prevention
				if (e.ctrlKey) return;

				if (this._isResizing) return;

				// Update input value
				EventFunctions.updateInputValueFromWheel(e);
			})
			.on("change", (e) => {
				const elementType: "rows" | "columns" = $(e.target)
					.attr("id")
					.replace("grid-", "") as "rows" | "columns";

				let semaphore =
					elementType == "rows" ? this._resizingRow : this._resizingColumn;

				if(!semaphore.lock()) {
					return;
				}

				this.dispatchEvent(new Event(`resize-${elementType}`));

				semaphore.unlock();
			});
	}
}
