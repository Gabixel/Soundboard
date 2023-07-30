/**
 * The collection tab manager.
 */
class CollectionTabs {
	private _$tabsContainer: JQuery<HTMLDivElement>;
	private _soundButtonCollection: SoundButtonCollection;

	/**
	 * Keyboard spam prevention.
	 */
	private _isAddCollectionButtonHeld: boolean = false;
	private _$addCollectionButton: JQuery<HTMLButtonElement>;

	constructor(
		$controlsContainer: JQuery<HTMLDivElement>,
		soundButtonCollection: SoundButtonCollection
	) {
		this._$tabsContainer = $controlsContainer.find(
			"#buttons-collections"
		) as JQuery<HTMLDivElement>;

		this._$addCollectionButton = $controlsContainer.find(
			"#add-collection-button"
		) as JQuery<HTMLButtonElement>;

		this._soundButtonCollection = soundButtonCollection;

		this.initTabContainerEvents();
		this.initAddCollectionButtonEvents();
		this.initWindowEventsForTabOverflow();
		this.checkForEmptyTabList();

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

				let focusNewTab = isEnterKey || (isLeftMouse && !e.shiftKey);

				this.createTab(focusNewTab);
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
	}

	private initWindowEventsForTabOverflow(): void {
		$(window).on("resize", () => this.updateTabListOverflow());
	}

	private createTab(focusNewTab: boolean = true): // id?: number,
	// name?: string,
	// buttonsData?: SoundButtonData[]
	void {
		let tab = this.generateTabElement(null);

		this.addDoubleClickEventToTab(tab);

		this._$tabsContainer.append(tab);

		Logger.logDebug(`New tab created: "${tab.text()}"`);

		if (focusNewTab) {
			console.debug("Focusing new tab");
			
			// TODO: select new tab as active
		}

		this.updateTabListOverflow();
	}

	private generateTabElement(
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

	private checkForEmptyTabList() {
		// TODO: use this method also when deleting is implemented

		if (!this._soundButtonCollection.isEmpty) {
			return;
		}

		this.createTab();
	}

	private addDoubleClickEventToTab(tab: JQuery<HTMLButtonElement>): void {
		tab.one("dblclick", () => {
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

	private addEventsToTabRenameInput(
		tab: JQuery<HTMLButtonElement>,
		renameInput: JQuery<HTMLInputElement>
	): void {
		renameInput.on("blur keydown", (e) => {
			const isBlur = e.type == "blur";
			const isEnterKey = e.type == "keydown" && e.key == "Enter";
			const isEscapeKey = e.type == "keydown" && e.key == "Escape";

			if (!isBlur && !isEnterKey && !isEscapeKey) {
				return;
			}

			let value = renameInput.attr("value");

			if (!isEscapeKey) {
				value = renameInput.val() as string;
			}

			// This also removes the input
			this.renameTab(tab, value, !isEscapeKey);

			// Re-add double click event
			this.addDoubleClickEventToTab(tab);

			this.updateTabListOverflow();
		});
	}

	private generateTabRenameInput(
		value: string,
		width: number
	): JQuery<HTMLInputElement> {
		const minTabInnerWidth = 70;

		width = Math.max(width, minTabInnerWidth);

		let input = $(`<input>`, {
			type: "text",
			id: "tab-rename-input",
			value,
			maxlength: 25,
			style: `width: ${width}px;`,
		}) as JQuery<HTMLInputElement>;

		return input;
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
