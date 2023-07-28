/**
 * The collection manager for sound buttons.
 */
class SoundButtonDataCollection {
	private _$controlsContainer: JQuery<HTMLDivElement>;
	private _$addCollectionButton: JQuery<HTMLButtonElement>;

	constructor($controlsContainer: JQuery<HTMLDivElement>) {
		this._$controlsContainer = $controlsContainer;
		this._$addCollectionButton = $controlsContainer.find(
			">button"
		) as JQuery<HTMLButtonElement>;
		console.log(this._$addCollectionButton);
	}
}
