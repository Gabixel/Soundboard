class SoundButtonDispatcher {
	public static readonly SOUNDBUTTON_CLASS: string = "soundbutton";
	public static readonly INDEX_CSS_VAR: string = "--index";

	private _soundButtonFactory: SoundButtonFactory;

	constructor(factory: SoundButtonFactory) {
		this._soundButtonFactory = factory;
	}

	public createSoundButton(
		buttonId: number,
		collectionId: number,
		initialData?: SoundButtonData
	): [SoundButtonElementJQuery, SoundButtonData] {
		let [$button, data] = this._soundButtonFactory.createSoundButton(
			buttonId,
			collectionId,
			initialData
		);

		return [$button, data];
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

	public updateSoundButtonData($button: SoundButtonElementJQuery, buttonId: number, data: SoundButtonData) {
		// TODO
		// this._soundButtonFactory.updateElementData()
	}

	public swapSoundButtons(
		$button1: SoundButtonElementJQuery,
		$button2: SoundButtonElementJQuery
	): {
		collectionId: number,
		dataId1: number,
		dataId2: number
	} {
		let swapData = this._soundButtonFactory.swapElements($button1, $button2);

		 return {
			collectionId: swapData.collectionId,
			dataId1: swapData.dataId1,
			dataId2: swapData.dataId2
		};
	}
}
