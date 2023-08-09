/**
 * The collection tab manager.
 */
class CollectionTabs {
	private static TAB_ID_PREFIX: string = "button-collection-tab-";
	private static TAB_CLASS: string = "tab-button";
	private static TAB_ACTIVE_CLASS: string = "active";
	private static RENAME_INPUT_ID: string = "tab-rename-input";

	private _$tabsContainer: JQuery<HTMLDivElement>;
	private _soundButtonCollection: SoundButtonCollection;
	private _grid: Grid;

	/**
	 * Keyboard spam prevention.
	 */
	private _isAddCollectionButtonHeld: boolean = false;
	private _$addCollectionButton: JQuery<HTMLButtonElement>;

	constructor(
		$controlsContainer: JQuery<HTMLDivElement>,
		soundButtonCollection: SoundButtonCollection,
		grid: Grid
	) {
		this._$tabsContainer = $controlsContainer.find<HTMLDivElement>(
			"#buttons-collections"
		);

		this._$addCollectionButton = $controlsContainer.find<HTMLButtonElement>(
			"#add-collection-button"
		);

		this._soundButtonCollection = soundButtonCollection;

		this._grid = grid;

		this.initTabContainerEvents();
		this.initWindowEventsForTabOverflow();
		this.checkForEmptyTabList();

		this.initAddCollectionButtonEvents();

		Logger.logDebug("Initialized!");
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
			`>.${CollectionTabs.TAB_CLASS}:not(.${CollectionTabs.TAB_ACTIVE_CLASS})`,
			(e) => {
				if (!$(e.target).is("." + CollectionTabs.TAB_CLASS)) {
					return;
				}

				let id = parseInt(
					(e.target.id as string).replace(CollectionTabs.TAB_ID_PREFIX, "")
				);

				this.focusTab(id);
				this._grid.focusGrid(id);

				this.updateTabListOverflow();
			}
		);
	}

	private initWindowEventsForTabOverflow(): void {
		$(window).on("resize", () => this.updateTabListOverflow());
	}

	private get activeTab(): JQuery<HTMLButtonElement> {
		return this._$tabsContainer.find<HTMLButtonElement>(
			`>.${CollectionTabs.TAB_CLASS}.${CollectionTabs.TAB_ACTIVE_CLASS}`
		);
	}

	private getTab(id: number): JQuery<HTMLButtonElement> {
		return this._$tabsContainer.find<HTMLButtonElement>(
			`>#${CollectionTabs.TAB_ID_PREFIX}${id}`
		);
	}

	private createTab(name: string, focusNewTab: boolean = true): void {
		let $tab = this.generateTabElement(null, name);

		this.addDoubleClickEventToTab($tab);

		this._$tabsContainer.append($tab);

		let tabName = $tab.text();

		Logger.logDebug(`New tab created: "${tabName}" (id: "${$tab[0].id}")`);

		let collection = this._soundButtonCollection.addNewCollection(tabName);

		this._grid.addNewGrid(collection.id, focusNewTab);

		if (focusNewTab) {
			this.focusTab(collection.id);
		}

		this.updateTabListOverflow();
	}

	private generateTabElement(
		id?: number,
		name?: string
	): JQuery<HTMLButtonElement> {
		if (!id) {
			id = this._soundButtonCollection.length;
		}

		let $tab = $<HTMLButtonElement>("<button>", {
			id: CollectionTabs.TAB_ID_PREFIX + id,
			class: CollectionTabs.TAB_CLASS,
			tabindex: -1,
			text: name ?? `Collection ${id + 1}`,
		});

		return $tab;
	}

	private focusTab(id: number): void {
		let $focusingTab = this.getTab(id);

		if ($focusingTab.length == 0) {
			throw new ReferenceError(`Tab not found with index "${id}"`);
		}

		Logger.logDebug(`Focusing tab with index "${id}"`);

		this.activeTab.removeClass(CollectionTabs.TAB_ACTIVE_CLASS);
		$focusingTab.addClass(CollectionTabs.TAB_ACTIVE_CLASS);

		this.scrollTabIntoView($focusingTab);
	}

	private scrollTabIntoView($tab: JQuery<HTMLButtonElement>): void {
		$tab[0].scrollIntoView({ behavior: "auto", inline: "nearest" });
		// TODO: add an overflow container for the scrolling tab div, so there's no need to apply manually an offset.
		// This mean that I need to apply a padding depending on the ".overflow-*" CSS class.
	}

	private checkForEmptyTabList(): void {
		// TODO: use this method also when deleting is implemented

		if (!this._soundButtonCollection.isEmpty) {
			return;
		}

		this.createTab(null, true);
	}

	private addDoubleClickEventToTab($tab: JQuery<HTMLButtonElement>): void {
		$tab.one("dblclick", () => {
			this.showTabRenameInput($tab);
		});
	}

	private showTabRenameInput($tab: JQuery<HTMLButtonElement>): void {
		let name = $tab.text();

		let tabInnerWidth =
			$tab.innerWidth() - +$tab.css("padding-left").replace("px", "") * 2;

		let renameInput = this.generateTabRenameInput(name, tabInnerWidth);
		this.addEventsToTabRenameInput($tab, renameInput);

		$tab.empty();
		$tab.append(renameInput);
		renameInput.trigger("focus");
		renameInput.trigger("select");

		this.updateTabListOverflow();
	}

	private addEventsToTabRenameInput(
		$tab: JQuery<HTMLButtonElement>,
		$renameInput: JQuery<HTMLInputElement>
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
			this.renameTab($tab, value, !isEscapeKey);

			// Re-add double click event
			this.addDoubleClickEventToTab($tab);

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
			id: CollectionTabs.RENAME_INPUT_ID,
			value,
			maxlength: 25,
			style: `width: ${width}px;`,
		});

		return $input;
	}

	private renameTab(
		tab: JQuery<HTMLButtonElement>,
		name: string,
		shouldSave: boolean = true
	): void {
		// Destroy input and apply new text
		tab.text(name);

		if (!shouldSave) {
			return;
		}

		// TODO: rename actual collection data
	}

	/**
	 * Updates the class by checking if the element is overflowing and/or scorlling.
	 */
	private updateTabListOverflow(): void {
		let container = this._$tabsContainer[0];

		const overflows = {
			left: container.scrollLeft > 0,
			right:
				Math.round(container.scrollLeft) + container.clientWidth <
				container.scrollWidth -
					4 * Math.round(parseFloat($(document.body).css("zoom"))),
		};

		this._$tabsContainer.toggleClass(
			"overflow-all",
			overflows.left && overflows.right
		);
		this._$tabsContainer.toggleClass(
			"overflow-left",
			overflows.left && !overflows.right
		);
		this._$tabsContainer.toggleClass(
			"overflow-right",
			!overflows.left && overflows.right
		);
	}
}
