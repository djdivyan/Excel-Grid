import type { ColumnManager } from "../ColumnManager.js";
import type { CommandManager } from "../Command/CommandManager.js";
import { ColumnResizeCommand, RowResizeCommand } from "../Command/ResizeCommands.js";
import type { IPointerAction } from "../interfaces/IPointerAction.js";
import type { RowManager } from "../RowManager.js";
import type { ViewportManager } from "../ViewportManager.js";

export class ResizeAction implements IPointerAction {
    private isResizingCol: boolean = false;
    private isResizingRow: boolean = false;
    private resizeIndex: number = -1;
    private oldSize: number = 0;
    private startMousePos: number = 0;

    constructor(
        private canvas: HTMLCanvasElement,
        private colManager: ColumnManager,
        private rowManager: RowManager,
        private viewportManager: ViewportManager,
        private commandManager: CommandManager,
        private onRedrawRequired: () => void,
        private onUIUpdateRequired: () => void
    ) {}

    handlePointerDown(e: PointerEvent, mouseX: number, mouseY: number, scrollX: number, scrollY: number): void {
        const boundary = this.viewportManager.getHoveredResizeBoundary(
            mouseX, mouseY, scrollX, scrollY, this.canvas.width, this.canvas.height
        );

        if (boundary.type === 'col') {
            this.isResizingCol = true;
            this.startMousePos = mouseX;
            this.resizeIndex = boundary.index;
            this.oldSize = boundary.oldSize;
        } else if (boundary.type === 'row') {
            this.isResizingRow = true;
            this.startMousePos = mouseY;
            this.resizeIndex = boundary.index;
            this.oldSize = boundary.oldSize;
        }
    }

    handlePointerMove(e: PointerEvent, mouseX: number, mouseY: number): void {
        //Col resize
        if (this.isResizingCol) {
            const diff = mouseX - this.startMousePos;
            const newWidth = Math.min(400, Math.max(50, this.oldSize + diff));
            this.colManager.setWidth(this.resizeIndex, newWidth);
            this.onRedrawRequired();
            this.onUIUpdateRequired(); // Updates spacer
        } else if (this.isResizingRow) { //Row resize
            const diff = mouseY - this.startMousePos;
            //newHeight considering min and max
            const newHeight = Math.min(300, Math.max(20, this.oldSize + diff));
            this.rowManager.setHeight(this.resizeIndex, newHeight);
            this.onRedrawRequired();
            this.onUIUpdateRequired(); 
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
}
