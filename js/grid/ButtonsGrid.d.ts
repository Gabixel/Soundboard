declare class ButtonsGrid {
    private static gridRows;
    private static gridCols;
    private static gridSize;
    private static btnCount;
    static updateRows(newValue: number): void;
    static updateColumns(newValue: number): void;
    private static updateSize;
    static get rows(): number;
    static get cols(): number;
    static get size(): number;
    static get buttonCount(): number;
    static resetButtonCount(): void;
    static increaseButtonCount(): void;
    static get isGridIncomplete(): boolean;
}
