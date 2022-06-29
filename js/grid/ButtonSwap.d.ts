/// <reference types="jquery" />
/// <reference types="jquery" />
declare let preparingDrag: boolean;
declare let isDragging: boolean;
declare let dragStartCoords: {
    x: number;
    y: number;
};
declare let $lastTarget: JQuery<HTMLElement> | null;
declare let $dragTarget: JQuery<HTMLElement> | null;
declare let indexChanged: boolean;
declare let isStyled: boolean;
declare let dragFunction: typeof mouseDrag_1;
declare function mouseDrag_1(e: JQuery.MouseMoveEvent): void;
declare function mouseDrag_2(e: JQuery.MouseMoveEvent): void;
declare function setOpacityDelay(cols: number, draggedButtonIndex: number): void;
declare function clearOpacityDelay(): void;
declare function onSoundButtonMouseEnter(e: JQuery.MouseEnterEvent): void;
declare function onSoundButtonMouseLeave(e: JQuery.MouseLeaveEvent): void;
declare function getElementFromPoint(x: number, y: number): JQuery<HTMLElement> | null;
declare function swapButtons($drag: JQuery<HTMLElement>, $drop: JQuery<HTMLElement>): void;
