import { ResizeAction } from "../Actions/ResizeAction.js";
import { SelectionAction } from "../Actions/SelectionAction.js";
import type { ColumnManager } from "../ColumnManager.js";
import type { CommandManager } from "../Command/CommandManager.js";
import { ColumnResizeCommand, RowResizeCommand } from "../Command/ResizeCommands.js";
import type { EditManager } from "../EditManager.js";
import type { IPointerAction } from "../interfaces/IPointerAction.js";
import type { RowManager } from "../RowManager.js";
import type { Selection } from "../Selection.js";
import type { ViewportManager } from "../ViewportManager.js";

//Using Strategy pattern to track hover state and then call that states move,up, down methods
export class PointerController {
    //Strategies
    private resizeAction: ResizeAction;
    private selectionAction: SelectionAction;

    //Tracks whichever action the user is currently performing
    private activeAction: IPointerAction | null = null;

    constructor(
        private canvas: HTMLCanvasElement,
        rowManager: RowManager,
        colManager: ColumnManager,
        private viewportManager: ViewportManager,
        selection: Selection,
        editManager: EditManager,
        commandManager: CommandManager,
        private rowHeaderWidth: number,
        private colHeaderHeight: number,
        private getScroll: () => { x: number, y: number },
        onRedrawRequired: () => void,
        onUIUpdateRequired: () => void
    ) {
        this.resizeAction = new ResizeAction(
            canvas, colManager, rowManager, viewportManager, commandManager, 
            onRedrawRequired, onUIUpdateRequired
        );
        
        this.selectionAction = new SelectionAction(
            canvas, selection, viewportManager, rowManager, colManager, editManager, 
            onRedrawRequired, onUIUpdateRequired
        );

        this.startEvents();
    }

    public setStrategy(action: IPointerAction): void{
        this.activeAction = action;
    }
    
    //down,move and up
    private startEvents() {
        this.canvas.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
        this.canvas.addEventListener('pointermove', (e) => this.handlePointerMove(e));
        this.canvas.addEventListener('pointerup', () => this.handlePointerUp());
        //double click listener for edit cell
        this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
    }

    private handlePointerDown(e: PointerEvent): void {   
        //get X and Y positions on canva via getcoord
        const { x, y, scroll } = this.getCoords(e);

        //choosing which strategy to use based on the cursor
        if (this.canvas.style.cursor.includes('resize')) {
            this.setStrategy(this.resizeAction);
        } else {
            this.setStrategy(this.selectionAction);
        }

        this.activeAction!.handlePointerDown(e, x, y, scroll.x, scroll.y);
    }

    private handlePointerMove(e: PointerEvent): void {
        
        //get X and Y positions on canva via getcoord
        const { x, y, scroll } = this.getCoords(e);

        //Resizing or selection
        //if we are currently dragging, route the event to the active action
        if (this.activeAction) {
            this.activeAction.handlePointerMove(e, x, y, scroll.x, scroll.y);
            return;
        }

        //if no action is active, we manage the Hover state cursors
        //Calling viewport for hoverboundry calc
        const boundary = this.viewportManager.getHoveredResizeBoundary(
            x, y, scroll.x, scroll.y, this.canvas.width, this.canvas.height
        );

        if (boundary.type === 'col') {
            this.canvas.style.cursor = 'col-resize'; 
        } else if (boundary.type === 'row') {
            this.canvas.style.cursor = 'row-resize';
        } else {
            //Normal header will have pointer
            if ((x > this.rowHeaderWidth && y < this.colHeaderHeight) || 
                (x < this.rowHeaderWidth && y > this.colHeaderHeight)) {
                this.canvas.style.cursor = 'pointer';
            } else {
                this.canvas.style.cursor = 'default';
            }
        }
    }

    private handlePointerUp(): void {
        if (this.activeAction) {
            this.activeAction.handlePointerUp();
            this.activeAction = null; // Reset state
        }
    }

    private handleDoubleClick(e: MouseEvent): void {
        //get X and Y positions on canva via getcoord
        const { x, y, scroll } = this.getCoords(e);
        this.selectionAction.handleDoubleClick(e, x, y, scroll.x, scroll.y);
    }

    private getCoords(e: MouseEvent | PointerEvent) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            scroll: this.getScroll()
        };
    }
}