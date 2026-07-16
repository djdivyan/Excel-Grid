export interface IPointerAction {
    handlePointerDown(e: PointerEvent, mouseX: number, mouseY: number, scrollX: number, scrollY: number): void;
    handlePointerMove(e: PointerEvent, mouseX: number, mouseY: number, scrollX: number, scrollY: number): void;
    handlePointerUp(): void;
}