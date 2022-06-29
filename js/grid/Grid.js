class Grid {
    static gridRows = 0;
    static gridCols = 0;
    static gridSize = 0;
    static _$grid;
    static soundButtonCount = 0;
    static _isFiltering = false;
    static get grid() {
        return this._$grid?.[0];
    }
    static get $grid() {
        return this._$grid;
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
        return this.soundButtonCount;
    }
    static get isGridIncomplete() {
        return this.soundButtonCount < this.size;
    }
    static get isFiltering() {
        return this._isFiltering;
    }
    static get $buttons() {
        return this._$grid.children(".soundbutton");
    }
    static get buttons() {
        return this._$grid.children(".soundbutton").toArray();
    }
    static initGrid($container) {
        this._$grid = $container;
    }
    static setRows(newValue) {
        this.gridRows = newValue;
        this.updateSize();
    }
    static setColumns(newValue) {
        this.gridCols = newValue;
        this.updateSize();
    }
    static updateSize() {
        this.gridSize = this.gridRows * this.gridCols;
    }
    static resetSoundButtonCount() {
        this.soundButtonCount = 0;
    }
    static increaseSoundButtonCount() {
        this.soundButtonCount++;
    }
    static set isFiltering(value) {
        this._isFiltering = value;
    }
    static getButtonAtIndex(index) {
        if (this._$grid?.[0] == null) {
            throw new Error("Grid is not initialized");
        }
        if (index >= this.gridSize) {
            Logger.error(this, this.getButtonAtIndex, `Index '${index}' is out of bounds. Current max index: (${this.gridSize} - 1 = ${this.gridSize - 1})`);
            return null;
        }
        const $btn = this.buttons.filter((e) => {
            const i = $(e).css("--index");
            return i != null && i === index.toString();
        });
        if ($btn.length > 0)
            return $btn[0];
        else
            return null;
    }
    static getEmptyIndexes() {
        const indexes = [];
        for (let i = 0; i < this.gridSize; i++) {
            if (this.isCellEmpty(i))
                indexes.push(i);
        }
        return indexes;
    }
    static isCellEmpty(index) {
        console.log(this.$buttons.css("--index"));
        return true;
    }
}
