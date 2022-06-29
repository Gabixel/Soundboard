declare class ToolbarManager {
    readonly menu: HTMLElement;
    readonly container: HTMLElement;
    constructor(container: HTMLElement);
    addMenuItem(item: HTMLElement): void;
}
