class GridDispatcher {
	private static readonly GRID_ID_PREFIX: string = "buttons-grid-";
	private static readonly GRID_CLASS: string = "buttons-grid";
	private static readonly GRID_ACTIVE_CLASS: string = "active";

	private _$gridsContainer: GridElementJQuery;

	private _gridResizer: GridResizer;

	private _soundButtonChild: GridSoundButtonChildFactory;
	private _gridSoundButtonEvents: GridSoundButtonEvents;
	private _soundButtonIdGenerator: ISoundButtonIdGenerator;

	private _collectionStore: SoundButtonCollectionStore;

	private get _$grids(): GridElementJQuery {
		return this._$gridsContainer.find<GridElement>(
			`>.${GridDispatcher.GRID_CLASS}`
		);
	}

	private get _$activeGrid(): GridElementJQuery {
		return this._$gridsContainer.find<GridElement>(
			`>.${GridDispatcher.GRID_CLASS}.${GridDispatcher.GRID_ACTIVE_CLASS}`
		);
	}

	private getGrid(id: number): GridElementJQuery {
		return this._$gridsContainer.find<GridElement>(
			`>#${GridDispatcher.GRID_ID_PREFIX}${id}`
		);
	}

	private getGridId($grid: GridElementJQuery): number {
		let gridId = $grid[0].id.replace(GridDispatcher.GRID_ID_PREFIX, "");

		return parseInt(gridId);
	}

	constructor(
		gridResizer: GridResizer,
		soundButtonChild: GridSoundButtonChildFactory,
		soundButtonIdGenerator: ISoundButtonIdGenerator,
		soundButtonEvents: GridSoundButtonEvents,
		collectionStore: SoundButtonCollectionStore,
		$gridsContainer: GridElementJQuery
	) {
		this._$gridsContainer = $gridsContainer;

		this._soundButtonChild = soundButtonChild;

		this._collectionStore = collectionStore;
		this._soundButtonIdGenerator = soundButtonIdGenerator;
		this.setupSoundButtonEvents(soundButtonEvents);

		this.setupGridResize(gridResizer);
	}

	private setupSoundButtonEvents(
		soundButtonEvents: GridSoundButtonEvents
	): void {
		this._gridSoundButtonEvents = soundButtonEvents;

		this._gridSoundButtonEvents.addEvents(this._$gridsContainer);
	}

	private setupGridResize(gridResizer: GridResizer): void {
		this._gridResizer = gridResizer;

		$(this._gridResizer)
			.on("resize", (_e) => {
				// TODO: update grids size on active tab change instead of a single call for all grids
				this.updateAllGridsSize();
				Logger.logDebug(
					`Grids resized to ${this._gridResizer.size} buttons (${this._gridResizer.rows}×${this._gridResizer.columns})`
				);
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
		this._gridSoundButtonEvents.cancelSwap()

		let $focusingGrid = this.getGrid(id);

		if ($focusingGrid.length == 0) {
			throw new ReferenceError(`Grid not found with index "${id}"`);
		}

		Logger.logDebug(`Focusing grid with index "${id}"`);

		this._$activeGrid.removeClass(GridDispatcher.GRID_ACTIVE_CLASS);
		$focusingGrid.addClass(GridDispatcher.GRID_ACTIVE_CLASS);
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

		this.addMissingButtonsToGrid($grid, id);

		this.updateGridButtonsVisibility($grid);

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
		gridId?: number,
		existingButtonsId?: number[]
	): void {
		let gridWidth = this._gridResizer.columns;
		let gridHeight = this._gridResizer.rows;

		let buttonAmount = gridWidth * gridHeight;

		gridId ??= this.getGridId($grid);

		existingButtonsId ??= this._collectionStore
			.getCollection(gridId)
			.buttonData.map((data) => data.index);

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
			id: GridDispatcher.GRID_ID_PREFIX + id,
			class: GridDispatcher.GRID_CLASS,
		});

		return $grid;
	}

	private updateAllGridsSize(): void {
		this._$gridsContainer
			.css("--rows", this._gridResizer.rows)
			.css("--columns", this._gridResizer.columns);

		if (this._gridResizer.previousSize < this._gridResizer.size) {
			this.updateAllGridsButtonsAmount();
		}

		this.updateAllGridsButtonsVisibility();
	}

	private updateAllGridsButtonsVisibility(): void {
		this._$grids.each((_i, grid) => {
			this.updateGridButtonsVisibility($(grid) as GridElementJQuery);
		});
	}

	private updateGridButtonsVisibility($grid: GridElementJQuery): void {
		let buttons = this.getSortedButtons($grid);
		$(buttons).removeClass("hidden");

		let overflowingButtons = buttons.slice(this._gridResizer.size);
		$(overflowingButtons).addClass("hidden");
	}

	private updateAllGridsButtonsAmount(): void {
		this._$grids.each((_i, grid) => {
			this.updateGridButtonsAmount($(grid) as GridElementJQuery);
		});
	}

	private updateGridButtonsAmount($grid: GridElementJQuery): void {
		this.addMissingButtonsToGrid($grid);
	}

	private getSortedButtons(
		$grid: GridElementJQuery
	): SoundButtonElementJQuery[] {
		return this._soundButtonChild.getSortedSoundButtonElements($grid);
	}
}
