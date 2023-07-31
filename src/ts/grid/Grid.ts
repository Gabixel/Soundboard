class Grid {
	private _$gridsContainer: JQuery<HTMLDivElement>;

	private _gridGenerator: GridGenerator;
	private _gridSize: GridSize;
	private _soundButtonSwap: SoundButtonSwap;

	constructor($gridsContainer: JQuery<HTMLDivElement>) {
		this._$gridsContainer = $gridsContainer;

		this._gridGenerator = new GridGenerator();
		this._gridSize = new GridSize();
		this._soundButtonSwap = new SoundButtonSwap();
	}
}