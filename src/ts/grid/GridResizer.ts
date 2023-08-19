class GridResizer extends EventTarget {
	private _rows: GridAxis;
	public get rows(): number {
		return this._rows.value;
	}
	
	private _columns: GridAxis;
	public get columns(): number {
		return this._columns.value;
	}

	public get size(): number {
		return this.rows * this.columns;
	}

	private get _isResizing(): boolean {
		return this._rows.semaphore.isLocked || this._columns.semaphore.isLocked;
	}

	constructor(
		$rowsInput: JQuery<HTMLInputElement>,
		$columnsInput: JQuery<HTMLInputElement>,
		rowCount: number = 3,
		columnCount: number = 7
	) {
		super();

		this._rows = {
			name: "rows",
			$input: $rowsInput.val(rowCount),
			value: rowCount,
			semaphore: new Semaphore(),
		};

		this._columns = {
			name: "columns",
			$input: $columnsInput.val(columnCount),
			value: columnCount,
			semaphore: new Semaphore(),
		};

		this.initInputEvents($rowsInput[0], this._rows);
		this.initInputEvents($columnsInput[0], this._columns);
	}

	private initInputEvents(input: HTMLInputElement, gridAxis: GridAxis): void {
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
			if (!gridAxis.semaphore.lock()) {
				return;
			}

			gridAxis.value = this.clampSizeValue($(e.target));

			this.dispatchEvent(new Event(`resize`));

			gridAxis.semaphore.unlock();
		});
	}

	private clampSizeValue($input: JQuery<HTMLInputElement>): number {
		const $target = $input;
		const value = parseInt($target.val().toString());

		let max = parseInt($target.attr("max").toString());
		let min = parseInt($target.attr("min").toString());

		let clampedValue = EMath.clamp(value, min, max);

		$target.val(clampedValue);

		return clampedValue;
	}
}
