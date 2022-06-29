/// <reference types="jquery" />
/// <reference types="jquery" />
declare class UiScale {
    private static $slider;
    private static $lock;
    private static $reset;
    private static min;
    private static max;
    static setControls($slider: JQuery<HTMLElement>, $lock: JQuery<HTMLElement>, $reset: JQuery<HTMLElement>): void;
    private static setLock;
    private static setReset;
    private static initSliderWheelShortcut;
    private static initSlider;
    private static initLock;
    private static initReset;
    private static get canChangeValue();
    private static setSliderValue;
}
