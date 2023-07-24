class GridNavigation {
	private _gridManager: GridManager;

	constructor(gridManager: GridManager) {
		this._gridManager = gridManager;
		this.setupArrowKeyNavigation();
	}

	private setupArrowKeyNavigation(): void {
		$(document).on("keydown", (e) => {
			// ArrrowX
			if (!e.key.startsWith("Arrow")) {
				return;
			}

			let $focusedButton = this._gridManager.$grid.find(".soundbutton:focus");

			// TODO: not sure if the arrow logic should work only when the grid has focus
			// No button has focus
			if ($focusedButton.length == 0) {
				return;
			}

			const currentTabIndex = parseInt($focusedButton.attr("tabindex"));

			const columns = this._gridManager.cols;
			const buttonsLength = this._gridManager.size;

			let finalTabIndex = 0;

			switch (e.key) {
				case "ArrowLeft":
					if (currentTabIndex > 0 && (currentTabIndex - 1) % columns != 0) {
						finalTabIndex = currentTabIndex - 1;
					}

					break;
				case "ArrowUp":
					if (currentTabIndex >= columns) {
						finalTabIndex = currentTabIndex - columns;
					}

					break;
				case "ArrowRight":
					if (
						currentTabIndex < buttonsLength &&
						currentTabIndex % columns != 0
					) {
						finalTabIndex = currentTabIndex + 1;
					}

					break;
				case "ArrowDown":
					if (currentTabIndex < buttonsLength - columns + 1) {
						finalTabIndex = currentTabIndex + columns;
					}

					break;
			}

			if (finalTabIndex == 0) {
				return;
			}

			// Focus
			this._gridManager.$buttons
				.filter(`[tabindex="${finalTabIndex}"]`)[0]
				.focus();
		});
	}
}
