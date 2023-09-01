class GridSoundButtonEdit {
	private _gridSoundButtonChildFactory: GridSoundButtonChildFactory;

	constructor(gridSoundButtonChildFactory: GridSoundButtonChildFactory) {
		this._gridSoundButtonChildFactory = gridSoundButtonChildFactory;
	}

	public handleEditEvent(): this {
		SoundboardApi.mainWindow.onButtonDataUpdate((parsedId, buttonData) => {
			this._gridSoundButtonChildFactory.updateSoundButton(parsedId, buttonData);
		});

		return this;
	}
}
