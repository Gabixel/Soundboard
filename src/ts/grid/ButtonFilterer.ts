/**
 * Filterer for sound buttons inside a grid
 */
class ButtonFilterer {
	private _gridManager: GridManager;

	private _filter: string[] = [];
	public get filter(): string[] {
		return this._filter;
	}

	public get isFiltering(): boolean {
		return this._filter.length > 0;
	}

	private get $filteredButtons(): JQuery<HTMLElement> {
		return this._gridManager.$buttons.filter(".filtered");
	}

	// TODO: trigger filter when a function for updating a button is implemented.
	// FIXME: trigger filter after clearing grid
	// FIXME: trigger filter after swapping buttons

	constructor(gridManager: GridManager) {
		this._gridManager = gridManager;

		Logger.logDebug("Initialized!");
	}

	public setupInputs(
		$filterInput: JQuery<HTMLInputElement>,
		$filterClearButton: JQuery<HTMLButtonElement>
	): this {
		// Trigger the filter input when the text changes
		$filterInput.on("input", () => {
			this.updateFilter();
		});

		// Clear filter
		$filterClearButton.on("click", () => {
			$filterInput.val("").trigger("input");
		});

		// TODO: make conditions dynamically changable
		$(
			"#filter-buttons-text, #filter-buttons-index, #filter-buttons-index-offset-select, #filter-buttons-tags, #filter-buttons-path"
		).on("change", () => {
			if (!this.isFiltering) return;

			$filterInput.trigger("input");
		});

		return this;
	}

	public filterButton($button: JQuery<HTMLElement>) {
		const shouldHideButton = this.shouldHide($button);

		if (shouldHideButton) {
			$button.removeClass("filtered").addClass("filtered");
		} else {
			// TODO: not sure if this is necessary
			$button.addClass("filtered");
			$button[0].offsetHeight;

			$button.removeClass("filtered");
		}
	}

	private updateFilter(): void {
		// Split by spaces
		const filterInput: string[] = $("#filter-buttons-input")
			.val()
			.toString()
			.split(" ");

		// Remove empty filters
		this._filter = filterInput.filter((text) => text.length > 0);

		// TODO: add filter for case-sensitive comparison
		// Make filters lowercased
		this._filter.forEach((text, i) => {
			this._filter[i] = text.toLowerCase();
		});

		this.visuallyUpdateFilter();
	}

	private visuallyUpdateFilter(): void {
		if (!this.isFiltering) {
			Logger.logInfo("Cleared filter.");
			this.clearFilter();
			return;
		}

		this._gridManager.$buttons.each((_i, btn) => {
			this.filterButton($(btn));
		});

		const filteredButtonsLength = this.$filteredButtons.length;

		const offset = $("#filter-buttons-index-offset-select option:selected").val();

		const conditions = [
			$("#filter-buttons-text").is(":checked") ? "text" : "",
			$("#filter-buttons-index").is(":checked") ? `index (offset: ${offset})` : "",
			$("#filter-buttons-tags").is(":checked") ? "tags" : "",
			$("#filter-buttons-path").is(":checked") ? "path" : "",
		].filter((f) => f.length > 0);

		Logger.logInfo(
			"Filtered " + filteredButtonsLength + " buttons.",
			"\nFilter:",
			this.filter,
			`\nConditions (${conditions.length}):`,
			conditions.length > 0 ? conditions.join(", ") : "none"
		);

		this._gridManager.$grid.toggleClass("filtering", filteredButtonsLength > 0);
	}

	private shouldHide($button: JQuery<HTMLElement>): boolean {
		return !this.filter.some((f) => {
			return this.isMatch($button, f);
		});
	}

	private isMatch($button: JQuery<HTMLElement>, f: string): boolean {
		return this.conditions.some((match) => match($button, f));
	}

	/**
	 * Removes the "filtered" class from all buttons.
	 */
	private clearFilter() {
		this.$filteredButtons.each((_i: number, btn: HTMLElement) =>
			this.showButton(btn)
		);
		this._gridManager.$grid.removeClass("filtering");
	}

	private showButton(button: HTMLElement) {
		$(button).removeClass("filtered");
	}

	private conditions: (($button: JQuery<HTMLElement>, f: string) => boolean)[] =
		[
			// Text
			($button: JQuery<HTMLElement>, f: string): boolean => {
				const text = $button.children(".button-theme").text();

				return (
					$("#filter-buttons-text").is(":checked") &&
					text != null &&
					text.toLowerCase().includes(f)
				);
			},
			// CSS Index
			($button: JQuery<HTMLElement>, f: string): boolean => {
				const index = parseInt($button.css("--index"));
				const offset = parseInt(
					$("#filter-buttons-index-offset-select option:selected").val().toString()
				);

				return (
					$("#filter-buttons-index").is(":checked") && index + offset === parseInt(f)
				);
			},
			// Tags
			($button: JQuery<HTMLElement>, f: string): boolean => {
				const tags = $button
					.attr("data-tags")
					?.split(" ")
					.filter((tag) => tag.length > 0);

				return (
					$("#filter-buttons-tags").is(":checked") &&
					tags != null &&
					tags.some((tag) => tag.toLowerCase().includes(f))
				);
			},
			// Path
			($button: JQuery<HTMLElement>, f: string): boolean => {
				const path = $button.attr("data-path");

				return (
					$("#filter-buttons-path").is(":checked") &&
					path != null &&
					decodeURI(path).toLowerCase().includes(f)
				);
			},
		];
}
