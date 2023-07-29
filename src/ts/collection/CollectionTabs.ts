/**
 * The collection tab manager.
 */
class CollectionTabs {
	private _soundButtonCollection: SoundButtonCollection;
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

	public attachSoundButtonCollection(collection: SoundButtonCollection): this {
		this._soundButtonCollection = collection;
		return this;
	}

	private initAddCollectionButtonEvents(): void {
		this._$addCollectionButton
			.on("keydown mouseup", (e) => {
				if (this._isAddCollectionButtonHeld) {
					return;
				}

				const isEnterKey = e.key === "Enter" || e.key === " ";
				const isLeftMouse = e.button === 0;

				// No extra keys involved
				if (!isEnterKey && !isLeftMouse) {
					return;
				}

				this._isAddCollectionButtonHeld = isEnterKey;

				this.prepareTab();
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
					scrollSpeed = 80;
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

				tabContainer.scrollLeft = scrollAmount;

				this.updateTabListOverflow();
			},
			{ passive: false }
		);
	}

	private initWindowEventsForTabOverflow(): void {
		$(window).on("resize", () => this.updateTabListOverflow());
	}

	private prepareTab(): // id?: number,
	// name?: string,
	// buttonsData?: SoundButtonData[]
	void {
		let tab = this.generateTab(null);

		this.addEventsToTab(tab);

		this._$tabsContainer.append(tab);

		this.updateTabListOverflow();
	}

	private generateTab(id?: number, name?: string): JQuery<HTMLButtonElement> {
		if (!id) {
			id = this._$tabsContainer.children("button.tab-button").length;
		}

		let tab = $(`<button id="button-collection-tab-${id}">`)
			.addClass("tab-button")
			.attr("tabindex", -1)
			.text(name ?? `Collection ${id + 1}`) as JQuery<HTMLButtonElement>;

		return tab;
	}

	private addEventsToTab(tab: JQuery<HTMLButtonElement>): void {
		tab.on("dblclick", () => {
			this.showTabRenameInput(tab);
		});
	}

	private showTabRenameInput(tab: JQuery<HTMLButtonElement>): void {
		let name = tab.text();

		let tabInnerWidth =
			tab.innerWidth() - +tab.css("padding-left").replace("px", "") * 2;

		let renameInput = this.generateTabRenameInput(name, tabInnerWidth);
		this.addEventsToTabRenameInput(tab, renameInput);

		tab.empty();
		tab.append(renameInput);
		renameInput.trigger("focus");
		renameInput.trigger("select");

		this.updateTabListOverflow();
	}

	private addEventsToTabRenameInput(_tab: JQuery<HTMLButtonElement>, renameInput: JQuery<HTMLInputElement>): void {
		renameInput.on("blur", () => {
			console.log("rename input blur");
			
		})
	}

	private generateTabRenameInput(
		value: string,
		width: number
	): JQuery<HTMLInputElement> {
		const maxTabInnerWidth = 100;

		if (isNaN(width) || width > maxTabInnerWidth) {
			width = maxTabInnerWidth;
		}

		let input = $(`<input>`, {
			type: "text",
			value,
			// style: `height: 1em; border: 0; background: transparent; color: #fff; width: ${width}px; padding: 0; margin: 0;`,
			style: `height: 1em; background: #fff; border: 0; color: #000; width: ${width}px; padding: 0; margin: 0;`,
		}) as JQuery<HTMLInputElement>;

		return input;
	}

	// private renameTab(id: number, newName: string): void {
	// 	this._$tabsContainer.find("")
	// }

	/**
	 * Updates the class by checking if the element is overflowing and/or scorlling.
	 */
	private updateTabListOverflow(): void {
		Logger.logWarn("TODO");
	}
}
