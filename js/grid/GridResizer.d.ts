/// <reference types="jquery" />
declare class GridResizer {
    private static grid;
    static setGrid(grid: Grid): void;
    private static setupResizeEvents;
}
declare let resizerStarted: boolean;
declare function initResizer(): void;
declare function updateRows(e: JQuery.ChangeEvent): void;
declare function updateColumns(e: JQuery.ChangeEvent): void;
declare function updateGrid(): void;
declare function updateVisibleButtons(): void;
declare function fillEmptyCells(): void;
declare function updateButtonFontSize(): void;
