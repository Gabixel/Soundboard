// TODO: working and functional toolbar
class ToolbarManager {
	readonly menu: HTMLElement;
	readonly container: HTMLElement;

	constructor(container: HTMLElement) {
		this.container = container;
		this.menu = document.getElementById("toolbar");
		this.menu.style.display = "none";
	}

	/**
	 * Adds an element to the menu.
	 * 
	 * @param item - The element to add.
	 */
	addMenuItem(item: HTMLElement): void {
		this.menu.appendChild(item);
	}
}
