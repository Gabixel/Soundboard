/**
 * The collection tab manager.
 */
class CollectionTabs {
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
		this.initTabContainerEvents();
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

				this.createCollectionTab();
			})
			.on("blur keyup", (_e) => {
				this._isAddCollectionButtonHeld = false;
			});
	}

	private initTabContainerEvents(): void {
		this._$tabsContainer.on("wheel", (e) => {
			if(e.ctrlKey) {
				return;
			}

			let tabContainer =  this._$tabsContainer[0]
			
			const maxScrollWidth = tabContainer.scrollWidth - tabContainer.clientWidth;

			// @ts-ignore
			let scrollAmount = e.deltaY;

			console.log(scrollAmount);
			
		});
	}

	private createCollectionTab(
		// id?: number,
		// name?: string,
		// buttonsData?: SoundButtonData[]
	): void {
		let tab = this.generateCollectionTab(null);

		this._$tabsContainer.append(tab);
	}

	private generateCollectionTab(
		id?: number,
		name?: string
	): JQuery<HTMLButtonElement> {
		if(!id) {
			id = this._$tabsContainer.children("button.tab-button").length;
		}
		
		let tab = $(`<button id="button-collection-tab-${id}">`)
			.addClass("tab-button")
			.attr("tabindex", -1)
			.text(name ?? `Collection ${id + 1}`) as JQuery<HTMLButtonElement>;

		return tab;
	}
}
