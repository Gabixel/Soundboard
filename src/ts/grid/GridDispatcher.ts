class GridDispatcher {
	private GRID_ID_PREFIX: Readonly<string> = "buttons-grid-";
	private GRID_CLASS: Readonly<string> = "buttons-grid";
	private GRID_ACTIVE_CLASS: Readonly<string> = "active";

	private _$gridsContainer: GridElementJQuery;

	private _gridResizer: GridResizer;

	private _soundButtonChild: GridSoundButtonChild;
	private _soundButtonEvents: GridSoundButtonEvents;

	private _collectionStore: SoundButtonCollectionStore;

	constructor(
		gridResizer: GridResizer,
		soundButtonChild: GridSoundButtonChild,
		soundButtonEvents: GridSoundButtonEvents,
		collectionStore: SoundButtonCollectionStore,
		$gridsContainer: GridElementJQuery
	) {
		this._soundButtonChild = soundButtonChild;

		this._$gridsContainer = $gridsContainer;

		this._collectionStore = collectionStore;

		this.setupSoundButtonEvents(soundButtonEvents);

		this.setupGridResize(gridResizer);
	}

	private setupSoundButtonEvents(
		soundButtonEvents: GridSoundButtonEvents
	): void {
		this._soundButtonEvents = soundButtonEvents;

		this._soundButtonEvents.addEvents(this._$gridsContainer);
	}

	private setupGridResize(gridResizer: GridResizer): void {
		this._gridResizer = gridResizer;

		$(this._gridResizer)
			.on("resize", (_e) => {
				this.updateGridSize();
				console.log("resizing grids");
			})
			.trigger("resize");
	}

	public addGridFromCollection(
		collection: SoundButtonDataCollection,
		focusNewGrid: boolean = true
	): void {
		this.createGrid(collection.id, collection);

		if (focusNewGrid) {
			this.focusGrid(collection.id);
		}
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

	private createGrid(id: number, collection?: SoundButtonDataCollection): void {
		let $grid = this.generateGridElement(id);

		if (this._$gridsContainer.find(`>#${$grid[0].id}`).length > 0) {
			throw new RangeError(`Grid already exists with index "${id}"`);
		}

		if (collection) {
			this.addButtonDataFromCollection($grid, id, collection.buttonData ?? []);
			Logger.logDebug(
				`Retrieved grid with index "${id}"\n`,
				"From collection: ",
				collection
			);
		} else {
			Logger.logDebug(`New grid created with index "${id}"`);
		}

		let existingButtonsId = this._collectionStore
			.getCollection(id)
			.buttonData.map((data) => data.index);

		this.addMissingButtonsToGrid($grid, id, existingButtonsId);

		this._$gridsContainer.append($grid);
	}

	private addButtonDataFromCollection(
		$grid: GridElementJQuery,
		gridId: number,
		buttonData: SoundButtonData[]
	): void {
		buttonData.forEach((data) => {
			let [$button] = this._soundButtonChild.createSoundButton(
				data.index,
				gridId,
				data
			);

			$grid.append($button);
		});
	}

	private addMissingButtonsToGrid(
		$grid: GridElementJQuery,
		gridId: number,
		existingButtonsId: number[]
	): void {
		let gridWidth = this._gridResizer.columns;
		let gridHeight = this._gridResizer.rows;

		let buttonAmount = gridWidth * gridHeight;

		for (let buttonId = 0; buttonId < buttonAmount; buttonId++) {
			if (existingButtonsId.includes(buttonId)) {
				continue;
			}

			let [$button] = this._soundButtonChild.createSoundButton(buttonId, gridId);

			$grid.append($button);
		}
	}

	private generateGridElement(id: number): GridElementJQuery {
		let $grid = $<GridElement>("<div>", {
			id: this.GRID_ID_PREFIX + id,
			class: this.GRID_CLASS,
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
