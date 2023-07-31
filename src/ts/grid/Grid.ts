class Grid {
	private _$gridsContainer: JQuery<HTMLDivElement>;

	private _gridGenerator: GridGenerator;
	private _gridSize: GridSize;
	private _soundButtonSwap: SoundButtonSwap;

	constructor($gridsContainer: JQuery<HTMLDivElement>) {
		this._$gridsContainer = $gridsContainer;
	}

	public setupGridGenerator(): this {
		this._gridGenerator = new GridGenerator();

		return this;
	}

	public setupGridSize(
		$rowsInput: JQuery<HTMLInputElement>,
		$columnsInput: JQuery<HTMLInputElement>
	): this {
		this._gridSize = new GridSize($rowsInput, $columnsInput);

		return this;
	}

	public setupButtonSwap(): this {
		this._soundButtonSwap = new SoundButtonSwap();

		return this;
	}
}
