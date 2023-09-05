class GridSoundButtonEdit {
	private _gridSoundButtonChildFactory: GridSoundButtonChildFactory;

	constructor(gridSoundButtonChildFactory: GridSoundButtonChildFactory) {
		this._gridSoundButtonChildFactory = gridSoundButtonChildFactory;
	}

	public handleEditEvent(onUpdate: ($button: SoundButtonElementJQuery, reset: boolean, animate: boolean) => void): this {
		SoundboardApi.mainWindow.onButtonDataUpdate((parsedId, buttonData, reset) => {
			let $button = this._gridSoundButtonChildFactory.updateSoundButton(parsedId, buttonData, reset);
			const animate = buttonData.isEdited
			onUpdate($button, reset, animate);
		});

		return this;
	}
}
