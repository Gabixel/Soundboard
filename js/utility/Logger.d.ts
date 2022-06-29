declare class LogExtend {
    protected static log(callerFunction: (...a: any[]) => any | null, message: string, ...args: any[]): void;
    protected static error(callerFunction: (...a: any[]) => any | null, message: string, ...args: any[]): void;
}
declare class Logger {
    private static chosenStyle;
    static log(callerClass: any, callerFunction: (...a: any[]) => any, message: string, ...args: any[]): void;
    static error(callerClass: any, callerFunction: (...a: any[]) => any, message: string, ...args: any[]): void;
    private static logInfo;
    private static logError;
    private static getHslFromString;
    private static getHueFromString;
    private static getHashFromString;
    private static getStyledAttributes;
    private static style0;
    private static style1;
}
