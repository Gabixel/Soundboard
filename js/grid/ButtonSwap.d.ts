/// <reference types="jquery" />
/// <reference types="jquery" />
declare let preparingDrag: boolean;
declare let isDragging: boolean;
declare let dragStartCoords: {
    x: number;
    y: number;
};
declare let $lastTarget: JQuery<HTMLElement> | null;
declare let targetChanged: boolean;
declare let isStyled: boolean;
declare function onButtonsGridMouseDrag(e: JQuery.MouseMoveEvent): void;
declare function onSoundButtonMouseEnter(e: JQuery.MouseEnterEvent): void;
declare function onSoundButtonMouseLeave(e: JQuery.MouseLeaveEvent): void;
declare function getElementFromPoint(x: number, y: number): JQuery<HTMLElement> | null;
declare function swapButtons($lastTarget: JQuery<HTMLElement>, $dropTarget: JQuery<HTMLElement>): void;
