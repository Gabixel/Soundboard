declare type ButtonData = {
    title: string;
    color: {
        h: number;
        s: number;
        l: number;
    };
    image: string;
    tags: string;
    path: string;
    index: number;
};
declare class SoundButton {
    private static paths;
    private static getRandomPath;
    static generateRandom(index: number): HTMLElement;
    static generate(data: ButtonData): HTMLElement;
    private static applyData;
}
