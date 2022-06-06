class ButtonsGrid {
    static gridRows = 1;
    static gridCols = 1;
    static gridSize = 1;
    static btnCount = 0;
    static updateRows(newValue) {
        this.gridRows = newValue;
        this.updateSize();
    }
    static updateColumns(newValue) {
        this.gridCols = newValue;
        this.updateSize();
    }
    static updateSize() {
        this.gridSize = this.gridRows * this.gridCols;
    }
    static get rows() {
        return this.gridRows;
    }
    static get cols() {
        return this.gridCols;
    }
    static get size() {
        return this.gridSize;
    }
    static get buttonCount() {
        return this.btnCount;
    }
    static resetButtonCount() {
        this.btnCount = 0;
    }
    static increaseButtonCount() {
        this.btnCount++;
    }
    static get isGridIncomplete() {
        return this.btnCount < this.size;
    }
}
