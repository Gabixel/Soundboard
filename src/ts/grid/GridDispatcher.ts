class GridDispatcher {
	private GRID_ID_PREFIX: Readonly<string>;
	private GRID_CLASS: Readonly<string>;
	private GRID_ACTIVE_CLASS: Readonly<string>;

	private _$gridsContainer: GridElementJQuery;

	private _gridResizer: GridResizer;

	private _soundButtonChild: GridSoundButtonChild;

	constructor(
		gridResizer: GridResizer,
		soundButtonChild: GridSoundButtonChild,
		$gridsContainer: GridElementJQuery,
		grid_id_prefix: string,
		grid_class: string,
		grid_active_class: string
	) {
		this.GRID_ID_PREFIX = grid_id_prefix;
		this.GRID_CLASS = grid_class;
		this.GRID_ACTIVE_CLASS = grid_active_class;

		this._soundButtonChild = soundButtonChild;

		this._$gridsContainer = $gridsContainer;

		this.setupGridResize(gridResizer);
	}

	private setupGridResize(gridResizer: GridResizer): this {
		this._gridResizer = gridResizer;

		$(this._gridResizer)
			.on("resize", (_e) => {
				this.updateGridSize();
				console.log("resizing");
			})
			.trigger("resize");

		return this;
	}

	public addGridsFromCollections(
		collections: SoundButtonDataCollection[]
	): this {
		collections.forEach((collection) => this.addGridFromCollection(collection));

		return this;
	}

	public addGridFromCollection(collection: SoundButtonDataCollection): this {
		this.createGrid(collection.id, collection.buttonData);

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
		// TODO: _soundButtonChild.cancelSwap()

		let $focusingGrid = this.getGrid(id);

		if ($focusingGrid.length == 0) {
			throw new ReferenceError(`Grid not found with index "${id}"`);
		}

		Logger.logDebug(`Focusing grid with index "${id}"`);

		this.activeGrid.removeClass(this.GRID_ACTIVE_CLASS);
		$focusingGrid.addClass(this.GRID_ACTIVE_CLASS);
	}

	private get activeGrid(): GridElementJQuery {
		return this._$gridsContainer.find<HTMLDivElement>(
			`>.${this.GRID_CLASS}.${this.GRID_ACTIVE_CLASS}`
		);
	}

	private getGrid(id: number): GridElementJQuery {
		return this._$gridsContainer.find<HTMLDivElement>(
			`>#${this.GRID_ID_PREFIX}${id}`
		);
	}

	private createGrid(id: number, buttonData?: SoundButtonData[]): void {
		let $grid = this.generateGridElement(id);

		if (this._$gridsContainer.find(`>#${$grid[0].id}`).length > 0) {
			throw new RangeError(`Grid already exists with index "${id}"`);
		}

		if (buttonData) {
			this.addButtonDataFromCollection($grid, buttonData);
			Logger.logDebug(
				`Retrieved grid from collection with index "${id}" and button data:\n`,
				buttonData
			);
		} else {
			Logger.logDebug(`New grid created with index "${id}"`);
		}

		this._$gridsContainer.append($grid);
	}

	private addButtonDataFromCollection(
		$grid: GridElementJQuery,
		buttonData: SoundButtonData[]
	): void {
		buttonData.forEach((data) => {
			let $button = this._soundButtonChild.createSoundButton(data.index, data);

			$grid.append($button);
		});
	}

	private generateGridElement(id: number): GridElementJQuery {
		let text = "grid " + id;

		let $grid = $<GridElement>("<div>", {
			id: this.GRID_ID_PREFIX + id,
			class: this.GRID_CLASS,
			text,
		});

		return $grid;
	}

	private updateGridSize(): void {
		this.updateSoundButtonAmount();

		this._$gridsContainer
			.css("--rows", this._gridResizer.rows)
			.css("--columns", this._gridResizer.columns);
	}

	private updateSoundButtonAmount(): void {}
}
