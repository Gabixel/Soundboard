abstract class CollectionTabsGridFactory {
	private _gridDispatcher: GridDispatcher<any, any>;

	constructor(gridDispatcher: GridDispatcher<any, any>) {
		this._gridDispatcher = gridDispatcher;
	}

	public focusGrid(id: number): void {
		this._gridDispatcher.focusGrid(id);
	}

	public addNewGrid(id: number, focusNewGrid: boolean = true): void {
		this._gridDispatcher.addNewGrid(id, focusNewGrid);
	}
}