class TopBarManager {
    menu;
    container;
    constructor(container) {
        this.container = container;
        this.menu = document.getElementById("topBarMenu");
        this.menu.style.display = "none";
    }
    addMenuItem(item) {
        this.menu.appendChild(item);
    }
}
