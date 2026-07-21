import type { ColumnManager } from "../ColumnManager.js";
import type { CommandManager } from "../Command/CommandManager.js";
import { ColumnResizeCommand, RowResizeCommand } from "../Command/ResizeCommands.js";
import { GridConfig } from "../config/GridConfig.js";
import type { ICoords } from "../interfaces/ICoords.js";
import type { IPointerAction } from "../interfaces/IPointerAction.js";
import type { RowManager } from "../RowManager.js";
import type { ViewportManager } from "../ViewportManager.js";

export class RowResizeAction implements IPointerAction {
    private isResizingRow: boolean = false;
    private resizeIndex: number = -1;
    private oldSize: number = 0;
    private startMousePos: number = 0;

    constructor(
        private canvas: HTMLCanvasElement,
        private rowManager: RowManager,
        private viewportManager: ViewportManager,
        private commandManager: CommandManager,
        private onRedrawRequired: () => void,
        private onUIUpdateRequired: () => void
    ) {}

    handlePointerDown(e: PointerEvent, mouseX: number, mouseY: number, scrollX: number, scrollY: number): boolean {
        const boundary = this.getHoveredResizeBoundary(
            mouseX, mouseY, scrollX, scrollY, this.canvas.width, this.canvas.height
        );

        if (boundary.type === 'row') {
            this.isResizingRow = true;
            this.startMousePos = mouseY;
            this.resizeIndex = boundary.index;
            this.oldSize = boundary.oldSize;
            
            return true;
        }

        return false;
    }

    handlePointerMove(e: PointerEvent, mouseX: number, mouseY: number): void {
        if (this.isResizingRow) { //Row resize
            const diff = mouseY - this.startMousePos;
            //newHeight considering min and max
            const newHeight = Math.min(600, Math.max(20, this.oldSize + diff));
            this.rowManager.setHeight(this.resizeIndex, newHeight);
            this.onRedrawRequired();
            this.onUIUpdateRequired(); 
        }
    }

    handlePointerUp(): void {
        //end Row resizing
        if (this.isResizingRow) {
            this.isResizingRow = false;
            const finalHeight = this.rowManager.getHeight(this.resizeIndex);
            if (finalHeight !== this.oldSize) {
                const command = new RowResizeCommand(this.rowManager, this.resizeIndex, this.oldSize, finalHeight);
                this.commandManager.executeCommand(command);
            }
        }
    }

    setCursor(coords: ICoords, canvasWidth: number, canvasHeight: number): boolean {
        const boundary = this.getHoveredResizeBoundary(
            coords.x, coords.y, coords.scroll.x, coords.scroll.y, canvasWidth, canvasHeight
        );
        
        if (boundary.type === 'row') {
            console.log("Row resize");
            this.canvas.style.cursor = 'row-resize';
            return true;
        }
        
        return false;
    }

    public getHoveredResizeBoundary(mouseX: number, mouseY: number, scrollX: number, scrollY: number, canvasWidth: number, canvasHeight: number): { type: 'col' | 'row' | 'none', index: number, oldSize: number } {
         //row header hover
        if (mouseX < GridConfig.dimensions.rowHeaderWidth && mouseY > GridConfig.dimensions.colHeaderHeight) {
            let currentY = 0;
            let rowIndex = 0;

            while (currentY - scrollY <= canvasHeight && rowIndex < this.rowManager.totalRows) {
                if (currentY + this.rowManager.getHeight(rowIndex) >= scrollY) {
                    let bottomEdge = (currentY - scrollY) +  GridConfig.dimensions.colHeaderHeight + this.rowManager.getHeight(rowIndex);
                    if (Math.abs(mouseY - bottomEdge) < 4) {
                        return { type: 'row', index: rowIndex, oldSize: this.rowManager.getHeight(rowIndex) };
                    }
                }
                currentY += this.rowManager.getHeight(rowIndex);
                rowIndex++;
            }
        }
        return { type: 'none', index: -1, oldSize: 0 };
    }
}
