class GridDispatcher {
	private static readonly GRID_ID_PREFIX: string = "buttons-grid-";
	private static readonly GRID_CLASS: string = "buttons-grid";
	private static readonly GRID_ACTIVE_CLASS: string = "active";

	private static readonly GRID_BUTTON_BIN_CLASS: string = "buttons-bin";

	private _$gridsContainer: GridElementJQuery;

	private _gridResizer: GridResizer;

	private _gridSoundButtonFilter: GridSoundButtonFilter;
	private _gridSoundButtonChildFactory: GridSoundButtonChildFactory;
	private _gridSoundButtonEvents: GridEvents;
	private _soundButtonIdGenerator: ISoundButtonIdGenerator;

	private _soundButtonCollectionStore: SoundButtonCollectionStore;

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

	private getGridName(id: number): string {
		return this._soundButtonCollectionStore.getCollection(id).name;
	}

	constructor(
		gridResizer: GridResizer,
		gridSoundButtonChildFactory: GridSoundButtonChildFactory,
		gridSoundButtonFilter: GridSoundButtonFilter,
		soundButtonIdGenerator: ISoundButtonIdGenerator,
		soundButtonEvents: GridEvents,
		soundButtonCollectionStore: SoundButtonCollectionStore,
		$gridsContainer: GridElementJQuery,
		$clearGridButton: JQuery<HTMLButtonElement>
	) {
		this._$gridsContainer = $gridsContainer;
		this._gridSoundButtonChildFactory = gridSoundButtonChildFactory;
		this.setupFilter(gridSoundButtonFilter);
		this._soundButtonCollectionStore = soundButtonCollectionStore;
		this._soundButtonIdGenerator = soundButtonIdGenerator;
		this.setupEvents(soundButtonEvents, $clearGridButton);
		this.setupGridResize(gridResizer);
	}

	private setupEvents(
		soundButtonEvents: GridEvents,
		$clearGridButton: JQuery<HTMLButtonElement>
	): void {
		this._gridSoundButtonEvents = soundButtonEvents;

		this._gridSoundButtonEvents.addSoundButtonEvents(this._$gridsContainer);
		this._gridSoundButtonEvents.addClearButtonClickEvent($clearGridButton, () => {
			let gridId = this.getGridId(this._$activeGrid);

			// TODO: put cool yes/no buttons inside the reset one
			window.confirm(
				`Are you sure you want to clear the grid "${this.getGridName(gridId)}"?`
			) && this.clearGrid(gridId);
		});
	}

	private setupFilter(gridSoundButtonFilter: GridSoundButtonFilter): void {
		this._gridSoundButtonFilter = gridSoundButtonFilter;

		$(this._gridSoundButtonFilter).on("filter", () => {
			console.log("test");
			
		});
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
		let $focusingGrid = this.getGrid(id);

		if ($focusingGrid.length == 0) {
			throw new ReferenceError(`Grid not found with index "${id}"`);
		}

		this.clearOngoingOperations();

		Logger.logDebug(`Focusing grid with index "${id}"`);

		this._$activeGrid.removeClass(GridDispatcher.GRID_ACTIVE_CLASS);
		$focusingGrid.addClass(GridDispatcher.GRID_ACTIVE_CLASS);
	}

	// TODO: FILTER
	public filterButtons(id?: number): void {
		id ??= this.getGridId(this._$activeGrid);

		let collection = this._soundButtonCollectionStore.getCollection(id);

		this._gridSoundButtonFilter.getFilteredOutButtons(collection.buttonData);
	}

	public clearGrid(id: number): void {
		let $grid = this.getGrid(id);

		if ($grid.length == 0) {
			throw new ReferenceError(`Grid not found with index "${id}"`);
		}

		this._soundButtonCollectionStore.clearCollectionData(id);

		this.moveChildrenToBin($grid, id);

		this.addMissingButtonsToGrid($grid, id);
	}

	private clearOngoingOperations(): void {
		this._gridSoundButtonEvents.cancelSwap();

		if (this._$activeGrid.length < 1) {
			return;
		}

		let $grid = this._$activeGrid;

		this.clearBinByGrid($grid, false);
	}

	private moveChildrenToBin(
		$grid: GridElementJQuery,
		id: number,
		animate = true
	): void {
		let $gridBin = $grid
			.children(`.${GridDispatcher.GRID_BUTTON_BIN_CLASS}`)
			.empty()
			.css("--rows", this._gridResizer.rows)
			.css("--columns", this._gridResizer.columns) as JQuery<HTMLDivElement>;

		$grid.children(`.${SoundButtonDispatcher.SOUNDBUTTON_CLASS}.hidden`).remove();

		$grid
			.children(`.${SoundButtonDispatcher.SOUNDBUTTON_CLASS}`)
			.removeClass(SoundButtonDispatcher.SOUNDBUTTON_CLASS)
			.addClass(SoundButtonDispatcher.SOUNDBUTTON_OLD_CLASS)
			.appendTo($gridBin);

		this.clearBin($gridBin, id, animate);
	}

	private clearBinByGrid($grid: GridElementJQuery, animate = true): void {
		let gridId = this.getGridId($grid);

		this.clearBin(
			$grid.children(
				`.${GridDispatcher.GRID_BUTTON_BIN_CLASS}`
			) as JQuery<HTMLDivElement>,
			gridId,
			animate
		);
	}

	private clearBin(
		$gridBin: JQuery<HTMLDivElement>,
		id: number,
		animate = true
	): void {
		MainWindow.removeTimeout(`clear-bin-${id}`);

		if (animate) {
			MainWindow.addTimeout(
				`clear-bin-${id}`,
				setTimeout(() => {
					$gridBin.empty();
				}, 1500)
			);
		} else {
			$gridBin.empty();
		}
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
			let $button = this._gridSoundButtonChildFactory.createSoundButton(
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

		existingButtonsId ??= this._soundButtonCollectionStore
			.getCollection(gridId)
			.buttonData.map((data) => data.index);

		for (let buttonId = 0; buttonId < buttonAmount; buttonId++) {
			if (existingButtonsId.includes(buttonId)) {
				continue;
			}

			let $button = this._gridSoundButtonChildFactory.createSoundButton(
				buttonId,
				gridId
			);

			$grid.append($button);
		}
	}

	private generateGridElement(id: number): GridElementJQuery {
		let $grid = $<GridElement>("<div>", {
			id: GridDispatcher.GRID_ID_PREFIX + id,
			class: GridDispatcher.GRID_CLASS,
		}).append(
			$("<div>", {
				class: GridDispatcher.GRID_BUTTON_BIN_CLASS,
				style: `--rows: ${this._gridResizer.rows}; --columns: ${this._gridResizer.columns};`,
			})
		);

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
		return this._gridSoundButtonChildFactory.getSortedSoundButtonElements($grid);
	}
}
