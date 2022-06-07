declare class SoundButton {
    private static paths;
    private static getRandomPath;
    static generateRandom(index: number): HTMLElement;
    static generate(data: SoundButtonData): HTMLElement;
    private static applyData;
}
