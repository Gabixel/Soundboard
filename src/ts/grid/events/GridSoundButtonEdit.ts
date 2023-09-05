class GridSoundButtonEdit extends EventTarget {
	private _gridSoundButtonChildFactory: GridSoundButtonChildFactory;

	constructor(gridSoundButtonChildFactory: GridSoundButtonChildFactory) {
		super();

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

	public triggerButtonEditEvent($button: SoundButtonElementJQuery, reset: boolean = false, animateIfReset: boolean = false): void {
		this.dispatchEvent(
			new CustomEvent(`buttonedit`, {
				detail: {
					$button,
					reset,
					animateIfReset,
				},
			})
		);
	}
}
