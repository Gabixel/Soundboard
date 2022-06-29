/// <reference types="jquery" />
/// <reference types="jquery" />
declare class Grid {
    private static gridRows;
    private static gridCols;
    private static gridSize;
    private static _$grid;
    private static soundButtonCount;
    private static _isFiltering;
    static get grid(): HTMLElement;
    static get $grid(): JQuery<HTMLElement>;
    static get rows(): number;
    static get cols(): number;
    static get size(): number;
    static get buttonCount(): number;
    static get isGridIncomplete(): boolean;
    static get isFiltering(): boolean;
    static get $buttons(): JQuery<HTMLElement>;
    static get buttons(): HTMLElement[];
    static initGrid($container: JQuery<HTMLElement>): void;
    static setRows(newValue: number): void;
    static setColumns(newValue: number): void;
    private static updateSize;
    static resetSoundButtonCount(): void;
    static increaseSoundButtonCount(): void;
    static set isFiltering(value: boolean);
    static getButtonAtIndex(index: number): HTMLElement;
    static getEmptyIndexes(): number[];
    static isCellEmpty(index: number): boolean;
}
