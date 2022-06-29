/// <reference types="jquery" />
/// <reference types="jquery" />
declare class ButtonFilter {
    private static _filter;
    static get filter(): string[];
    static get isFiltering(): boolean;
    static updateFilter(): void;
}
declare function globallyUpdateFilter(): void;
declare function filterButton($button: JQuery<HTMLElement>): void;
declare function shouldHide($button: JQuery<HTMLElement>): boolean;
declare function isMatch($button: JQuery<HTMLElement>, f: string): boolean;
declare function clearFilter(): void;
declare function showButton(index: number, button: HTMLElement): void;
declare const showConditions: (($button: JQuery<HTMLElement>, f: string) => boolean)[];
