abstract class CollectionTabsGridFactory {
	private _gridDispatcher: GridDispatcher;

	constructor(gridDispatcher: GridDispatcher) {
		this._gridDispatcher = gridDispatcher;
	}

	protected focusGrid(id: number): void {
		this._gridDispatcher.focusGrid(id);
	}

	protected addNewGrid(id: number, focusNewGrid: boolean = true): void {
		this._gridDispatcher.addNewGrid(id, focusNewGrid);
	}
}
