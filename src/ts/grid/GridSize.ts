class GridSize {
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
		this._rowCount = rowCount;
		this._columnCount = columnCount;

		this._$rowsInput = $rowsInput;
		this._$columnsInput = $columnsInput;
	}
}
