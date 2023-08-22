class GridSoundButtonEdit {
	private _gridSoundButtonChildFactory: GridSoundButtonChildFactory;
	private _$gridsContainer: JQuery<HTMLElement>;

	constructor(
		gridSoundButtonChildFactory: GridSoundButtonChildFactory,
		$gridsContainer: JQuery<HTMLElement>
	) {
		this._gridSoundButtonChildFactory = gridSoundButtonChildFactory;
		this._$gridsContainer = $gridsContainer;
	}

	public handleEditEvent(): this {
		SoundboardApi.mainWindow.onButtonDataUpdate((parsedId, buttonData) => {
			this._gridSoundButtonChildFactory.updateSoundButton(parsedId, buttonData);
		});

		return this;
	}
}
