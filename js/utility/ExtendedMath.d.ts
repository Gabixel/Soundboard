declare class EMath {
    static clamp(value: number, min: number, max: number): number;
    static randomInt(min?: number, max?: number): number;
    static rgbToHsl(r: number, g: number, b: number): number[];
    static hslToRgb(h: number, s: number, l: number): number[];
    static getEponentialValue(initialValue: number, base?: number): number;
    static logarithmicValue(pos: number, minPos?: number, maxPos?: number, minRes?: number, maxRes?: number): number;
}
