declare class SoundboardApi extends LogExtend {
    static openContextMenu(args?: any): void;
    static get isProduction(): boolean;
    static isPathFile(path: string): boolean;
}
