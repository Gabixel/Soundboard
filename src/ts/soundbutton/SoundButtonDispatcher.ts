class SoundButtonDispatcher {
	public static readonly SOUNDBUTTON_CLASS: string = "soundbutton";
	public static readonly SOUNDBUTTON_OLD_CLASS: string = "soundbutton_old";
	public static readonly INDEX_CSS_VAR: string = "--index";

	private _soundButtonFactory: SoundButtonFactory;

	constructor(factory: SoundButtonFactory) {
		this._soundButtonFactory = factory;
	}

	public createSoundButton(
		buttonId: number,
		collectionId: number,
		initialData: SoundButtonData
	): SoundButtonElementJQuery {
		let $button = this._soundButtonFactory.createSoundButton(
			buttonId,
			collectionId,
			initialData
		);

		return $button;
	}

	public getSortedSoundButtonElements(
		$parent: JQuery<HTMLElement>
	): SoundButtonElementJQuery[] {
		return (
			$parent
				.find(`>.${SoundButtonDispatcher.SOUNDBUTTON_CLASS}`)
				.toArray() as unknown as SoundButtonElementJQuery[]
		).sort((a, b) => {
			let aIndex = parseInt($(a).css(SoundButtonDispatcher.INDEX_CSS_VAR));
			let bIndex = parseInt($(b).css(SoundButtonDispatcher.INDEX_CSS_VAR));

			return aIndex - bIndex;
		});
	}

	public updateSoundButton(parsedId: string, buttonData: SoundButtonData): SoundButtonElementJQuery {
		return this._soundButtonFactory.updateElementDataByParsedId(parsedId, buttonData);
	}

	public swapSoundButtons(
		$button1: SoundButtonElementJQuery,
		$button2: SoundButtonElementJQuery
	): void {
		this._soundButtonFactory.swapElements($button1, $button2);
	}

	public getSoundButtonElement(
		buttonId: number,
		collectionId: number
	): SoundButtonElementJQuery {
		return this._soundButtonFactory.getButtonElement(buttonId, collectionId);
	}

	public getSoundButtonElementByParsedId(
		parsedId: string
	): SoundButtonElementJQuery {
		return this._soundButtonFactory.getButtonElementByParsedId(parsedId);
	}

	public getParsedSoundButtonId(buttonId: number, collectionId: number): string {
		return this._soundButtonFactory.getParsedSoundButtonId(
			buttonId,
			collectionId
		);
	}

	public getCompositeSoundButtonId(parsedButtonId: string): {
		buttonId: number;
		collectionId: number;
	} {
		return this._soundButtonFactory.getCompositeSoundButtonId(parsedButtonId);
	}
}
