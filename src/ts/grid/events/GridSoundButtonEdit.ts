class GridSoundButtonEdit {
	private _gridSoundButtonChildFactory: GridSoundButtonChildFactory;

	constructor(gridSoundButtonChildFactory: GridSoundButtonChildFactory) {
		this._gridSoundButtonChildFactory = gridSoundButtonChildFactory;
	}

	public handleEditEvent(onUpdate: () => void): this {
		SoundboardApi.mainWindow.onButtonDataUpdate((parsedId, buttonData) => {
			this._gridSoundButtonChildFactory.updateSoundButton(parsedId, buttonData);
			onUpdate();
		});

		return this;
	}
}
