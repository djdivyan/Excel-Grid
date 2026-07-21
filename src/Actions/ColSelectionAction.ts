import type { ColumnManager } from "../ColumnManager.js";
import { GridConfig } from "../config/GridConfig.js";
import type { EditManager } from "../EditManager.js";
import type { ICoords } from "../interfaces/ICoords.js";
import type { IPointerAction } from "../interfaces/IPointerAction.js";
import type { RowManager } from "../RowManager.js";
import type { Selection } from "../Selection.js";
import type { ViewportManager } from "../ViewportManager.js";

export class ColSelectionAction implements IPointerAction {
    constructor(
        private canvas: HTMLCanvasElement,
        private selection: Selection,
        private viewportManager: ViewportManager,
        private rowManager: RowManager,
        private onRedrawRequired: () => void,
        private onUIUpdateRequired: () => void
    ) {}

    handlePointerDown(e: PointerEvent, mouseX: number, mouseY: number, scrollX: number, scrollY: number): boolean {
        //Check for Cell Selection
        const { row, col } = this.viewportManager.convertToCell(mouseX, mouseY, scrollX, scrollY);

        if (row < 0 && col >= 0) {
            this.selection.setStart(0, col);
            this.selection.setEnd(this.rowManager.totalRows, col);
            this.onRedrawRequired();
            this.onUIUpdateRequired();

            return true;
        }

        return false;
    }
    
    //Handle Active Selection Dragging
    handlePointerMove(e: PointerEvent, mouseX: number, mouseY: number, scrollX: number, scrollY: number): void {
        if (!this.selection.isSelecting) return;

        const { row, col } = this.viewportManager.convertToCell(mouseX, mouseY, scrollX, scrollY);
        
        if (row < 0 && col >= 0) {
            if (this.selection.endRow !== row || this.selection.endCol !== col) {
                this.selection.setEnd(this.rowManager.totalRows, col);
                //if new cell
                this.onRedrawRequired();
                this.onUIUpdateRequired();
            }
        }
    }

    handlePointerUp(): void {
        if (this.selection.isSelecting) {
            this.selection.finishSelecting();
        }
    }

    setCursor(coords: ICoords, canvasWidth: number, canvasHeight: number): boolean {
        
        if ((coords.x > GridConfig.dimensions.rowHeaderWidth && coords.y < GridConfig.dimensions.colHeaderHeight)) {
            this.canvas.style.cursor = 'pointer';
            return true;
        } 
        return false;  
    }
}