import type { ICoords } from "./ICoords.js";

export interface IPointerAction {
    handlePointerDown(e: PointerEvent, mouseX: number, mouseY: number, scrollX: number, scrollY: number): boolean;
    handlePointerMove(e: PointerEvent, mouseX: number, mouseY: number, scrollX: number, scrollY: number): void;
    handlePointerUp(): void;
    handleDoubleClick?(e: MouseEvent, mouseX: number, mouseY: number, scrollX: number, scrollY: number): boolean;
    setCursor?(coords: ICoords,canvasWidth: number, canvasHeight: number): boolean;
}