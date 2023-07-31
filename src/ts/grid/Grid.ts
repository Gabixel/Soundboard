class Grid {
	private static GRID_ID_PREFIX: string = "buttons-grid-";
	private static GRID_CLASS: string = "buttons-grid";
	private static GRID_ACTIVE_CLASS: string = "focused";

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

	public addGridFromCollection(_collection: SoundButtonDataCollection): this {
		return this;
	}

	public addGridsFromCollections(
		collections: SoundButtonDataCollection[]
	): this {
		collections.forEach((collection) => this.addGridFromCollection(collection));

		return this;
	}
	
	public focusGrid(id: number): void {
		// Cancel possible button dragging
		this._soundButtonSwap.cancelSwap();

		this.activeGrid.removeClass(Grid.GRID_ACTIVE_CLASS);
		this.getGrid(id).addClass(Grid.GRID_ACTIVE_CLASS);
	}

	private get activeGrid(): JQuery<HTMLDivElement> {
		return this._$gridsContainer.find(
			`>.${Grid.GRID_CLASS}.${Grid.GRID_ACTIVE_CLASS}`
		) as JQuery<HTMLDivElement>;
	}

	private getGrid(id: number): JQuery<HTMLDivElement> {
		return this._$gridsContainer.find(
			`>#${Grid.GRID_ID_PREFIX}${id}`
		) as JQuery<HTMLDivElement>;
	}

	private createGrid(): void {
		let $grid = this.generateGridElement(1);

		this._$gridsContainer.append($grid);
	}

	private generateGridElement(id: number): JQuery<HTMLDivElement> {
		let $grid = $("<div>", {
			id: Grid.GRID_ID_PREFIX + id,
			class: Grid.GRID_CLASS,
		}) as JQuery<HTMLDivElement>;

		return $grid;
	}
}
