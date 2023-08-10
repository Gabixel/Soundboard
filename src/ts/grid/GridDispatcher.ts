class GridDispatcher {
	private GRID_ID_PREFIX: Readonly<string> = "buttons-grid-";
	private GRID_CLASS: Readonly<string> = "buttons-grid";
	private GRID_ACTIVE_CLASS: Readonly<string> = "active";

	private _$gridsContainer: JQuery<HTMLDivElement>;

	private _gridResizer: GridResizer;
	private _soundButtonSwap: SoundButtonSwap;

	constructor($gridsContainer: JQuery<HTMLDivElement>) {
		this._$gridsContainer = $gridsContainer;
	}

	public setupGridSize(
		$rowsInput: JQuery<HTMLInputElement>,
		$columnsInput: JQuery<HTMLInputElement>
	): this {
		this._gridResizer = new GridResizer($rowsInput, $columnsInput);
		$(this._gridResizer).on("resize", (_e) => {
			this.updateGridSize();
			console.log("resizing");
		});

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

		this.activeGrid.removeClass(this.GRID_ACTIVE_CLASS);
		$focusingGrid.addClass(this.GRID_ACTIVE_CLASS);
	}

	private get activeGrid(): JQuery<HTMLDivElement> {
		return this._$gridsContainer.find<HTMLDivElement>(
			`>.${this.GRID_CLASS}.${this.GRID_ACTIVE_CLASS}`
		);
	}

	private getGrid(id: number): JQuery<HTMLDivElement> {
		return this._$gridsContainer.find<HTMLDivElement>(
			`>#${this.GRID_ID_PREFIX}${id}`
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
		let rows = this._gridResizer.rows;
		let columns = this._gridResizer.columns;

		let $grid = $<HTMLDivElement>("<div>", {
			id: this.GRID_ID_PREFIX + id,
			class: this.GRID_CLASS,
			style: `--rows: ${rows}; --columns: ${columns};`,
			text,
		});

		return $grid;
	}

	private updateGridSize(): void {
		this.updateSoundButtonAmount();

		this._$gridsContainer
			.find<HTMLDivElement>(`>.${this.GRID_CLASS}`)
			.css("--rows", this._gridResizer.rows)
			.css("--columns", this._gridResizer.columns);
	}

	private updateSoundButtonAmount(): void {
		
	}
}
