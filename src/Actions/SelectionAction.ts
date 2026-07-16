import type { ColumnManager } from "../ColumnManager.js";
import type { EditManager } from "../EditManager.js";
import type { IPointerAction } from "../interfaces/IPointerAction.js";
import type { RowManager } from "../RowManager.js";
import type { Selection } from "../Selection.js";
import type { ViewportManager } from "../ViewportManager.js";

export class SelectionAction implements IPointerAction {
    constructor(
        private canvas: HTMLCanvasElement,
        private selection: Selection,
        private viewportManager: ViewportManager,
        private rowManager: RowManager,
        private colManager: ColumnManager,
        private editManager: EditManager,
        private onRedrawRequired: () => void,
        private onUIUpdateRequired: () => void
    ) {}

    handlePointerDown(e: PointerEvent, mouseX: number, mouseY: number, scrollX: number, scrollY: number): void {
        //Check for Cell Selection
        const { row, col } = this.viewportManager.convertToCell(mouseX, mouseY, scrollX, scrollY);

        if (row >= 0 && col >= 0) {
            //1st click Selects then 2nd click edit calls for mobile users
            const currentBounds = this.selection.getSelection();
            
            //Check if the exact same single cell is already selected for mobile
            if (
                e.pointerType === 'touch' && 
                currentBounds.minRow === row && currentBounds.maxRow === row && 
                currentBounds.minCol === col && currentBounds.maxCol === col
            ) {
                this.handleDoubleClick(e, mouseX, mouseY, scrollX, scrollY);
                return; 
            }

            this.selection.setStart(row, col);
        } else if (row >= 0 && col < 0) {
            this.selection.setStart(row, 0);
            this.selection.setEnd(row, this.colManager.totalColumns);
        } else if (row < 0 && col >= 0) {
            this.selection.setStart(0, col);
            this.selection.setEnd(this.rowManager.totalRows, col);
        }

        this.onRedrawRequired();
        this.onUIUpdateRequired();
    }
    
    //Handle Active Selection Dragging
    handlePointerMove(e: PointerEvent, mouseX: number, mouseY: number, scrollX: number, scrollY: number): void {
        if (!this.selection.isSelecting) return;

        const { row, col } = this.viewportManager.convertToCell(mouseX, mouseY, scrollX, scrollY);
        
        if (row >= 0 && col >= 0) {
            if (this.selection.endRow !== row || this.selection.endCol !== col) {
                this.selection.setEnd(row, col);
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

    handleDoubleClick(e: MouseEvent, mouseX: number, mouseY: number, scrollX: number, scrollY: number): void {
        const { row, col } = this.viewportManager.convertToCell(mouseX, mouseY, scrollX, scrollY);
        if (row >= 0 && col >= 0) {
            const rect = this.canvas.getBoundingClientRect();
            //show a dynamic input box
            this.editManager.showEditor(row, col, scrollX, scrollY, rect);
        }
    }
}