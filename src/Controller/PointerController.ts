import { CellSelectionAction } from "../Actions/MouseActions/CellSelectionAction.js";
import { ColResizeAction } from "../Actions/MouseActions/ColResizeAction.js";
import { ColSelectionAction } from "../Actions/MouseActions/ColSelectionAction.js";
import { RowResizeAction } from "../Actions/MouseActions/RowResizeAction.js";
import { RowSelectionAction } from "../Actions/MouseActions/RowSelectionAction.js";
import type { ColumnManager } from "../ColumnManager.js";
import type { CommandManager } from "../Command/CommandManager.js";
import type { EditManager } from "../EditManager.js";
import type { ICoords } from "../interfaces/ICoords.js";
import type { IPointerAction } from "../interfaces/IPointerAction.js";
import type { RowManager } from "../RowManager.js";
import type { Selection } from "../Selection.js";
import type { ViewportManager } from "../ViewportManager.js";

//Using Strategy pattern to track hover state and then call that states move,up, down methods
export class PointerController {
    //Tracks whichever action the user is currently performing
    private activeAction: IPointerAction | null = null;
    private handlers: IPointerAction[] = []; 

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
        //Registering Handlers
        this.addHandlers(new RowResizeAction(
            canvas, rowManager, viewportManager, commandManager, 
            onRedrawRequired, onUIUpdateRequired
        ));
        this.addHandlers( new ColResizeAction(
            canvas, colManager, viewportManager, commandManager, 
            onRedrawRequired, onUIUpdateRequired
        ));
        //Selection Handlers
        this.addHandlers(new CellSelectionAction(
            canvas, selection, viewportManager, editManager, 
            onRedrawRequired, onUIUpdateRequired
        ));
        this.addHandlers(new ColSelectionAction(
            canvas, selection, viewportManager, rowManager, 
            onRedrawRequired, onUIUpdateRequired
        ));
        this.addHandlers(new RowSelectionAction(
            canvas, selection, viewportManager, colManager, 
            onRedrawRequired, onUIUpdateRequired
        ));

        this.startEvents();
    }

    public setActiveAction(action: IPointerAction): void{
        this.activeAction = action;
    }

    public addHandlers(action: IPointerAction): void{
       this.handlers.push(action);
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

        //choosing which strategy to use
        for (const handler of this.handlers) {
            if (handler.handlePointerDown(e, x, y, scroll.x, scroll.y)) {
                this.activeAction = handler;
                return;
            }
        }

        // this.activeAction!.handlePointerDown(e, x, y, scroll.x, scroll.y);
    }

    private handlePointerMove(e: PointerEvent): void {
        
        //get X and Y positions on canva via getcoord
        const coords: ICoords = this.getCoords(e);

        //Resizing or selection
        //if we are currently dragging, route the event to the active action
        if (this.activeAction) {
            this.activeAction.handlePointerMove(e, coords.x, coords.y, coords.scroll.x, coords.scroll.y);
            return;
        }

        //if no action is active, we manage the Hover state cursors
        for (const handler of this.handlers) {
            if (handler.setCursor && handler.setCursor(coords,this.canvas.width,this.canvas.height)) {
                return;
            }
        }
        this.canvas.style.cursor = "defualt";
    }

    private handlePointerUp(): void {
        if (this.activeAction) {
            this.activeAction.handlePointerUp();
            this.activeAction = null; // Reset state
        }
    }

    private handleDoubleClick(e: MouseEvent): void {
        //get X and Y positions on canva via getcoord
        const coords: ICoords = this.getCoords(e);

        for (const handler of this.handlers) {
            if (handler.handleDoubleClick && handler.handleDoubleClick(e, coords.x, coords.y, coords.scroll.x, coords.scroll.y)) {
                return;
            }
        }    
    }

    private getCoords(e: MouseEvent | PointerEvent) : ICoords{
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            scroll: this.getScroll()
        };
    }
}