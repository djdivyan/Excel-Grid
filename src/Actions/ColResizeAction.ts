import type { ColumnManager } from "../ColumnManager.js";
import type { CommandManager } from "../Command/CommandManager.js";
import { ColumnResizeCommand, RowResizeCommand } from "../Command/ResizeCommands.js";
import { GridConfig } from "../config/GridConfig.js";
import type { ICoords } from "../interfaces/ICoords.js";
import type { IPointerAction } from "../interfaces/IPointerAction.js";
import type { ViewportManager } from "../ViewportManager.js";

export class ColResizeAction implements IPointerAction {
    private isResizingCol: boolean = false;
    private resizeIndex: number = -1;
    private oldSize: number = 0;
    private startMousePos: number = 0;

    constructor(
        private canvas: HTMLCanvasElement,
        private colManager: ColumnManager,
        private viewportManager: ViewportManager,
        private commandManager: CommandManager,
        private onRedrawRequired: () => void,
        private onUIUpdateRequired: () => void
    ) {}

    handlePointerDown(e: PointerEvent, mouseX: number, mouseY: number, scrollX: number, scrollY: number): boolean {
        const boundary = this.getHoveredResizeBoundary(
            mouseX, mouseY, scrollX, scrollY, this.canvas.width, this.canvas.height
        );

        if (boundary.type === 'col') {
            this.isResizingCol = true;
            this.startMousePos = mouseX;
            this.resizeIndex = boundary.index;
            this.oldSize = boundary.oldSize;
            return true;
        }

        return false;
    }

    handlePointerMove(e: PointerEvent, mouseX: number, mouseY: number): void {
        //Col resize
        if (this.isResizingCol) {
            const diff = mouseX - this.startMousePos;
            const newWidth = Math.min(800, Math.max(50, this.oldSize + diff));
            this.colManager.setWidth(this.resizeIndex, newWidth);
            this.onRedrawRequired();
            this.onUIUpdateRequired(); // Updates spacer
        }
    }

    handlePointerUp(): void {
        //end Col resizing
        if (this.isResizingCol) {
            this.isResizingCol = false; 
            const finalWidth = this.colManager.getWidth(this.resizeIndex);
            if (finalWidth !== this.oldSize) {
                const command = new ColumnResizeCommand(this.colManager, this.resizeIndex, this.oldSize, finalWidth);
                this.commandManager.executeCommand(command);
            }
        }
    }

    setCursor(coords: ICoords, canvasWidth: number, canvasHeight: number): boolean {
        const boundary = this.getHoveredResizeBoundary(
            coords.x, coords.y, coords.scroll.x, coords.scroll.y, canvasWidth, canvasHeight
        );
        
        if (boundary.type === 'col') {
            this.canvas.style.cursor = 'col-resize'; 
            return true;
        }
        return false;  
    }

    //resize hover detection in mouse events
    public getHoveredResizeBoundary(mouseX: number, mouseY: number, scrollX: number, scrollY: number, canvasWidth: number, canvasHeight: number): { type: 'col' | 'row' | 'none', index: number, oldSize: number } {
        
        //for column header hover
        if (mouseX > GridConfig.dimensions.rowHeaderWidth && mouseY < GridConfig.dimensions.colHeaderHeight) {
            let currentX = 0;
            let colIndex = 0;

            while (currentX - scrollX <= canvasWidth && colIndex < this.colManager.totalColumns) {
                //visible onscreen
                if (currentX + this.colManager.getWidth(colIndex) >= scrollX) {
                    let rightEdge = (currentX - scrollX) +  GridConfig.dimensions.rowHeaderWidth + this.colManager.getWidth(colIndex);
                    //check mouse within 4 px of edge
                    if (Math.abs(mouseX - rightEdge) < 4) {
                        return { type: 'col', index: colIndex, oldSize: this.colManager.getWidth(colIndex) };
                    }
                }
                currentX += this.colManager.getWidth(colIndex);
                colIndex++;
            }
        }

        return { type: 'none', index: -1, oldSize: 0 };
    }
}
