/**
 * The collection manager for sound buttons.
 */
class SoundButtonDataCollection {
	private _$tabsContainer: JQuery<HTMLDivElement>;

	/**
	 * Keyboard spam prevention.
	 */
	private _isAddCollectionButtonHeld: boolean = false;
	private _$addCollectionButton: JQuery<HTMLButtonElement>;

	constructor($controlsContainer: JQuery<HTMLDivElement>) {
		this._$tabsContainer = $controlsContainer.find(
			"#buttons-collections"
		) as JQuery<HTMLDivElement>;

		this._$addCollectionButton = $controlsContainer.find(
			"#add-collection-button"
		) as JQuery<HTMLButtonElement>;
		
		this.initAddCollectionButtonEvents();
	}

	private initAddCollectionButtonEvents(): void {
		this._$addCollectionButton
			.on("keydown mouseup", (e) => {
				if (this._isAddCollectionButtonHeld) {
					return;
				}

				const isEnterKey = e.key === "Enter";
				const isLeftMouse = e.button === 0;

				// No extra keys involved
				if (!isEnterKey && !isLeftMouse) {
					return;
				}

				this._isAddCollectionButtonHeld = isEnterKey;
			})
			.on("blur keyup", (_e) => {
				this._isAddCollectionButtonHeld = false;
			});
	}
}
