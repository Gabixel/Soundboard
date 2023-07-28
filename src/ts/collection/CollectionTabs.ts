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
		this.initWindowEventsForTabOverflow();
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
		this._$tabsContainer[0].addEventListener(
			"wheel",
			(e) => {
				if (e.ctrlKey) {
					return;
				}

				let scrollSpeed = 50;

				// Prevent native horizontal scrolling
				if (e.shiftKey) {
					e.preventDefault();
					scrollSpeed = 100;
				}

				let tabContainer = this._$tabsContainer[0];

				const maxScrollWidth = tabContainer.scrollWidth - tabContainer.clientWidth;
				const previousScrollLeft = tabContainer.scrollLeft;

				// @ts-ignore
				let scrollAmount = EventFunctions.getUpdatedValueFromWheel(
					e,
					previousScrollLeft,
					scrollSpeed,
					[0, maxScrollWidth]
				);

				if (scrollAmount == previousScrollLeft) {
					return;
				}

				// $(tabContainer).stop(true, false);
				// $(tabContainer).animate(
				// 	{
				// 		scrollLeft: scrollAmount,
				// 	},
				// 	325
				// );

				console.log(tabContainer.scrollWidth);
				console.log(tabContainer.clientWidth);
				console.log(tabContainer.scrollLeft);

				tabContainer.scrollLeft = scrollAmount;

				console.log(scrollAmount);
				console.log("---------------");

				this.updateTabListOverflow();
			},
			{ passive: false }
		);
	}

	private initWindowEventsForTabOverflow(): void {
		Logger.logError("TODO");

		// TODO: API function to check for "finished resize"
	}

	private createCollectionTab(): // id?: number,
	// name?: string,
	// buttonsData?: SoundButtonData[]
	void {
		let tab = this.generateCollectionTab(null);

		this._$tabsContainer.append(tab);

		this.updateTabListOverflow();
	}

	private generateCollectionTab(
		id?: number,
		name?: string
	): JQuery<HTMLButtonElement> {
		if (!id) {
			id = this._$tabsContainer.children("button.tab-button").length;
		}

		let tab = $(`<button id="button-collection-tab-${id}">`)
			.addClass("tab-button")
			.attr("tabindex", -1)
			.text(name ?? `Collection ${id + 1}`) as JQuery<HTMLButtonElement>;

		return tab;
	}

	/**
	 * Updates the class by checking if the element is overflowing and/or scorlling.
	 */
	private updateTabListOverflow(): void {}
}
