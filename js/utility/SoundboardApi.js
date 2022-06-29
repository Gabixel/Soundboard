class SoundboardApi extends LogExtend {
    static openContextMenu(args = null) {
        this.log(this.openContextMenu, "Opening context menu with args:", args);
        window.api.openContextMenu(args);
    }
    static get isProduction() {
        return window.api.isProduction;
    }
    static isPathFile(path) {
        return window.api.isPathFile(path);
    }
}
