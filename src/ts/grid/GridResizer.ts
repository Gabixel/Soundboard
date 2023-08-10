class GridResizer extends EventTarget {
	private _rowCount: number;
	private _columnCount: number;

	private _$rowsInput: JQuery<HTMLInputElement>;
	private _$columnsInput: JQuery<HTMLInputElement>;

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
		this._$rowsInput.on("wheel", () => {

		})
		.on("change", () => {

		});
		this._$columnsInput.on("wheel", () => {

		})
		.on("change", () => {

		});
	}

	private updateRowCount(): void {

	}

	private updateColumnCount(): void {

	}
}
