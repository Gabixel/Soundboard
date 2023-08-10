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

		this.initInputEvents($rowsInput[0]);
		this.initInputEvents($columnsInput[0]);
	}

	private initInputEvents(input: HTMLInputElement): void {
		input.addEventListener(
			"wheel",
			(e) => {
				e.preventDefault();

				// UI Scale prevention
				if (e.ctrlKey) {
					return;
				}

				// Prevent base scrolling behavior (if chromium triggers it)
				e.stopImmediatePropagation();

				if (this._isResizing) {
					return;
				}

				EventFunctions.updateInputValueFromWheel(e);
			},
			{
				passive: false,
			}
		);

		$(input).on("change", (e) => {
			const elementType: "rows" | "columns" = $(e.target)
				.attr("id")
				.replace("grid-", "") as "rows" | "columns";

			let semaphore =
				elementType == "rows" ? this._resizingRow : this._resizingColumn;

			if (!semaphore.lock()) {
				return;
			}

			this.dispatchEvent(new Event(`resize-${elementType}`));

			semaphore.unlock();
		});
	}
}
