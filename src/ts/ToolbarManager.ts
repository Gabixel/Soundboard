class ToolbarManager {
	readonly menu: HTMLElement;
	readonly container: HTMLElement;

	constructor(container: HTMLElement) {
		this.container = container;
		this.menu = document.getElementById("toolbar");
		this.menu.style.display = "none";
	}
	/**
	 * Add a menu item to the menu
	 * @param item - the menu item to add
	 */
	addMenuItem(item: HTMLElement): void {
		this.menu.appendChild(item);
	}
}
