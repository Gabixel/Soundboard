/// <reference types="jquery" />
declare class EventFunctions {
    static updateInputValueFromWheel(e: JQuery.TriggeredEvent, stepValue?: number, trigger?: boolean, triggers?: string[]): void;
    static getUpdatedInputValueFromWheel(e: JQuery.TriggeredEvent, stepValue?: number): number;
    static getUpdatedValueFromWheel(e: JQuery.TriggeredEvent, currentValue: number, stepValue?: number, clamp?: [number, number] | null): number;
}
