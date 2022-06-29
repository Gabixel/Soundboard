class ToolbarManager {
    menu;
    container;
    constructor(container) {
        this.container = container;
        this.menu = document.getElementById("toolbar");
        this.menu.style.display = "none";
    }
    addMenuItem(item) {
        this.menu.appendChild(item);
    }
}
