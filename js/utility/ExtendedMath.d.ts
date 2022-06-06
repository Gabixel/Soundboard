declare class EMath {
    static clamp(value: number, min: number, max: number): number;
    static randomInt(min?: number, max?: number): number;
    static rgbToHsl(r: number, g: number, b: number): number[];
    static hslToRgb(h: number, s: number, l: number): number[];
    static getEponentialVolume(volume: number, base?: number): number;
}
