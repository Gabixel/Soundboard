class GridDispatcher {
	private static GRID_ID_PREFIX: string = "buttons-grid-";
	private static GRID_CLASS: string = "buttons-grid";
	private static GRID_ACTIVE_CLASS: string = "active";

	private _$gridsContainer: JQuery<HTMLDivElement>;

	private _gridSize: GridResizer;
	private _soundButtonSwap: SoundButtonSwap;

	constructor($gridsContainer: JQuery<HTMLDivElement>) {
		this._$gridsContainer = $gridsContainer;
	}

	public setupGridSize(
		$rowsInput: JQuery<HTMLInputElement>,
		$columnsInput: JQuery<HTMLInputElement>
	): this {
		this._gridSize = new GridResizer($rowsInput, $columnsInput);

		return this;
	}

	public setupButtonSwap(): this {
		this._soundButtonSwap = new SoundButtonSwap();

		return this;
	}

	public addGridsFromCollections(
		collections: SoundButtonDataCollection[]
	): this {
		collections.forEach((collection) => this.addGridFromCollection(collection));

		return this;
	}

	public addGridFromCollection(collection: SoundButtonDataCollection): this {
		this.createGrid(collection.id);

		return this;
	}

	public addNewGrid(id: number, focusNewGrid: boolean = true): void {
		this.createGrid(id);

		if (focusNewGrid) {
			this.focusGrid(id);
		}
	}

	public focusGrid(id: number): void {
		// Cancel possible button dragging
		this._soundButtonSwap.cancelSwap();

		let $focusingGrid = this.getGrid(id);

		if ($focusingGrid.length == 0) {
			throw new ReferenceError(`Grid not found with index "${id}"`);
		}

		Logger.logDebug(`Focusing grid with index "${id}"`);

		this.activeGrid.removeClass(GridDispatcher.GRID_ACTIVE_CLASS);
		$focusingGrid.addClass(GridDispatcher.GRID_ACTIVE_CLASS);
	}

	private get activeGrid(): JQuery<HTMLDivElement> {
		return this._$gridsContainer.find<HTMLDivElement>(
			`>.${GridDispatcher.GRID_CLASS}.${GridDispatcher.GRID_ACTIVE_CLASS}`
		);
	}

	private getGrid(id: number): JQuery<HTMLDivElement> {
		return this._$gridsContainer.find<HTMLDivElement>(
			`>#${GridDispatcher.GRID_ID_PREFIX}${id}`
		);
	}

	private createGrid(id: number): void {
		let $grid = this.generateGridElement(id);

		if (this._$gridsContainer.find(`>#${$grid[0].id}`).length > 0) {
			throw new RangeError(`Grid already exists with index "${id}"`);
		}

		this._$gridsContainer.append($grid);

		Logger.logDebug(`New grid created with index "${id}"`);
	}

	private generateGridElement(id: number): JQuery<HTMLDivElement> {
		let text = "grid " + id;

		let $grid = $<HTMLDivElement>("<div>", {
			id: GridDispatcher.GRID_ID_PREFIX + id,
			class: GridDispatcher.GRID_CLASS,
			text,
		});

		return $grid;
	}
}