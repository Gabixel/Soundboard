/// <reference types="jquery" />
/// <reference types="jquery" />
declare class SoundButton extends LogExtend {
    private static paths;
    private static $grid;
    private static dropEffect;
    private static getRandomPath;
    static generateRandom(index: number): HTMLElement;
    static createWithData(data: SoundButtonData, index: number): HTMLElement;
    private static applyInitialData;
    private static addDragAndDrop;
    static updateData($button: JQuery<HTMLElement>, data: SoundButtonData): void;
    static setGrid(grid: JQuery<HTMLElement>): void;
    private static initContextMenu;
    private static initClick;
}
