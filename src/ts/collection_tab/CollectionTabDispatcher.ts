/**
 * The collection tab manager.
 */
class CollectionTabDispatcher extends CollectionTabGridFactory {
	private TAB_ID_PREFIX: Readonly<string> = "button-collection-tab-";
	private TAB_CLASS: Readonly<string> = "tab-button";
	private TAB_ACTIVE_CLASS: Readonly<string> = "active";
	private RENAME_INPUT_ID: Readonly<string> = "tab-rename-input";

	private _$tabsContainer: JQuery<HTMLDivElement>;
	private _collectionStore: SoundButtonCollectionStore;

	/**
	 * Keyboard spam prevention.
	 */
	private _isAddCollectionButtonHeld: boolean = false;
	private _$addCollectionButton: JQuery<HTMLButtonElement>;

	constructor(
		soundButtonCollection: SoundButtonCollectionStore,
		gridDispatcher: GridDispatcher,
		$controlsContainer: JQuery<HTMLDivElement>
	) {
		super(gridDispatcher);

		this._$tabsContainer = $controlsContainer.find<HTMLDivElement>(
			"#buttons-collections"
		);

		this._$addCollectionButton = $controlsContainer.find<HTMLButtonElement>(
			"#add-collection-button"
		);

		this._collectionStore = soundButtonCollection;

		this.initTabContainerEvents();
		this.initWindowEventsForTabOverflow();
		this.initAddCollectionButtonEvents();

		this.addTabsFromExistingCollections();

		this.checkForEmptyTabList();

		Logger.logDebug("Initialized!");
	}

	private addTabsFromExistingCollections(): void {
		this._collectionStore.getAllCollections().forEach((collection) => {
			this.createTab(collection, collection.focused);
		});
	}

	private initAddCollectionButtonEvents(): void {
		this._$addCollectionButton
			.on("keydown mouseup", (e) => {
				if (this._isAddCollectionButtonHeld) {
					return;
				}

				// No extra keys involved
				if (!EventFunctions.isSubmitKey(e) && !EventFunctions.isSubmitKey(e)) {
					return;
				}

				this._isAddCollectionButtonHeld = EventFunctions.isSubmitKey(e);

				let focusNewTab = !e.shiftKey;

				this.createTab(null, focusNewTab);
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

				let scrollAmount = EventFunctions.getUpdatedValueFromWheel(
					e,
					previousScrollLeft,
					-scrollSpeed,
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

		this._$tabsContainer.on(
			"click",
			`>.${this.TAB_CLASS}:not(.${this.TAB_ACTIVE_CLASS})`,
			(e) => {
				if (!$(e.target).is(`.${this.TAB_CLASS}`)) {
					return;
				}

				let id = parseInt((e.target.id as string).replace(this.TAB_ID_PREFIX, ""));

				this.focusTab(id);
				super.focusGrid(id);

				this.updateTabListOverflow();
			}
		);
	}

	private initWindowEventsForTabOverflow(): void {
		$(window).on("resize", () => this.updateTabListOverflow());
	}

	private get activeTab(): JQuery<HTMLButtonElement> {
		return this._$tabsContainer.find<HTMLButtonElement>(
			`>.${this.TAB_CLASS}.${this.TAB_ACTIVE_CLASS}`
		);
	}

	private getTab(id: number): JQuery<HTMLButtonElement> {
		return this._$tabsContainer.find<HTMLButtonElement>(
			`>#${this.TAB_ID_PREFIX}${id}`
		);
	}

	private createTab(
		collection: SoundButtonDataCollection = null,
		focusNewTab: boolean = true
	): void {
		let isNewCollection = false;

		if (!collection) {
			isNewCollection = true;
			collection = this._collectionStore.addNewCollection();
		}

		let collectionId = collection.id;

		let $tab = this.generateTabElement(collectionId, collection.name);

		this._$tabsContainer.append($tab);

		Logger.logDebug(
			`New tab created: "${collection.name}" (id: "${collectionId}")`
		);

		if (focusNewTab) {
			this.focusTab(collection.id);
		}

		if (isNewCollection) {
			super.addNewGrid(collection.id, focusNewTab);
		} else {
			super.addGridFromCollection(collection, focusNewTab);
		}

		this.addDoubleClickEventToTab($tab, collectionId);

		this.updateTabListOverflow();
	}

	private generateTabElement(
		id: number,
		name: string
	): JQuery<HTMLButtonElement> {
		let $tab = $<HTMLButtonElement>("<button>", {
			id: this.TAB_ID_PREFIX + id,
			class: this.TAB_CLASS,
			tabindex: -1,
		});

		this.setTabText($tab, name);

		return $tab;
	}

	private focusTab(id: number): void {
		let $focusingTab = this.getTab(id);

		if ($focusingTab.length == 0) {
			throw new ReferenceError(`Tab not found with index "${id}"`);
		}

		Logger.logDebug(`Focusing tab with index "${id}"`);

		this._collectionStore.setActiveCollection(id);
		this.activeTab.removeClass(this.TAB_ACTIVE_CLASS);
		$focusingTab.addClass(this.TAB_ACTIVE_CLASS);

		this.scrollTabIntoView($focusingTab);
	}

	private scrollTabIntoView($tab: JQuery<HTMLButtonElement>): void {
		$tab[0].scrollIntoView({ behavior: "auto", inline: "nearest" });
		// TODO: add an overflow container for the scrolling tab div, so there's no need to apply manually an offset.
		// This mean that I need to apply a padding depending on the ".overflow-*" CSS class.
	}

	private checkForEmptyTabList(): void {
		// TODO: use this method also when deleting is implemented

		if (!this._collectionStore.isEmpty) {
			return;
		}

		this.createTab(null, true);
	}

	private addDoubleClickEventToTab(
		$tab: JQuery<HTMLButtonElement>,
		collectionId: number
	): void {
		$tab.one("dblclick", () => {
			this.showTabRenameInput($tab, collectionId);
		});
	}

	private showTabRenameInput(
		$tab: JQuery<HTMLButtonElement>,
		collectionId: number
	): void {
		let name = $tab.text();

		let tabInnerWidth =
			$tab.innerWidth() - +$tab.css("padding-left").replace("px", "") * 2;

		let renameInput = this.generateTabRenameInput(name, tabInnerWidth);
		this.addEventsToTabRenameInput($tab, renameInput, collectionId);

		$tab.empty();
		$tab.append(renameInput);
		renameInput.trigger("focus");
		renameInput.trigger("select");

		this.updateTabListOverflow();
	}

	private addEventsToTabRenameInput(
		$tab: JQuery<HTMLButtonElement>,
		$renameInput: JQuery<HTMLInputElement>,
		collectionId: number
	): void {
		$renameInput.on("blur keydown", (e) => {
			const isBlur = e.type == "blur";
			const isEnterKey = e.type == "keydown" && e.key == "Enter";
			const isEscapeKey = e.type == "keydown" && e.key == "Escape";

			if (!isBlur && !isEnterKey && !isEscapeKey) {
				return;
			}

			let value = $renameInput.attr("value");

			if (!isEscapeKey) {
				value = $renameInput.val() as string;
			}

			// This also removes the rename input
			this.renameTab($tab, value, !isEscapeKey, collectionId);

			// Re-add double click event
			this.addDoubleClickEventToTab($tab, collectionId);

			this.updateTabListOverflow();
		});
	}

	private generateTabRenameInput(
		value: string,
		width: number
	): JQuery<HTMLInputElement> {
		const minTabInnerWidth = 70;

		width = Math.max(width, minTabInnerWidth);

		let $input = $<HTMLInputElement>(`<input>`, {
			type: "text",
			id: this.RENAME_INPUT_ID,
			value,
			maxlength: 25,
			style: `width: ${width}px;`,
		});

		return $input;
	}

	private renameTab(
		$tab: JQuery<HTMLButtonElement>,
		name: string,
		shouldSave: boolean = true,
		collectionId: number
	): void {
		this.setTabText($tab, name);

		if (!shouldSave) {
			return;
		}

		this._collectionStore.setCollectionName(collectionId, name);
	}

	private setTabText($tab: JQuery<HTMLButtonElement>, text: string): void {
		let $span = $("<span>", {
			text,
		});

		// Destroy existing children and apply new text
		$tab.empty();
		$tab.append($span);
	}

	/**
	 * Updates the class by checking if the element is overflowing and/or scorlling.
	 */
	private updateTabListOverflow(): void {
		let container = this._$tabsContainer[0];

		const zoomOffset = 4;
		let zoomScale =
			zoomOffset * Math.round(parseFloat($(document.body).css("zoom")));

		let leftScroll = container.scrollLeft;

		let width = container.clientWidth;
		let scrollWidth = container.scrollWidth;

		const overflows = {
			left: container.scrollLeft > 0,
			right: leftScroll + width < scrollWidth - zoomScale,
		};
		const onlyLeft = overflows.left && !overflows.right;
		const onlyRight = !overflows.left && overflows.right;

		this._$tabsContainer.toggleClass(
			"overflow-all",
			overflows.left && overflows.right
		);

		this._$tabsContainer.toggleClass("overflow-left", onlyLeft);
		this._$tabsContainer.toggleClass("overflow-right", onlyRight);
	}
}
