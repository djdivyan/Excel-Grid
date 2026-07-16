import { ColumnManager } from "./ColumnManager.js";
import type { CommandManager } from "./Command/CommandManager.js";
import { EditCommand } from "./Command/EditCommand.js";
import { ColumnResizeCommand, RowResizeCommand } from "./Command/ResizeCommands.js";
import { KeyboardController } from "./Controller/KeyboardController.js";
import { PointerController } from "./Controller/PointerController.js";
import type { DataStore } from "./DataStore.js";
import { EditManager } from "./EditManager.js";
import { GridRenderer } from "./GridRenderer.js";
import { RowManager } from "./RowManager.js";
import { Selection } from "./Selection.js";
import { SummaryCalculator } from "./SummaryCalculator.js";
import { ViewportManager } from "./ViewportManager.js";

export class Grid {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    
    private rowManager: RowManager;
    private colManager: ColumnManager;

    //Defualt is 0 when page loads, Updated when user scrolls
    private scrollX: number = 0;
    private scrollY: number = 0;

    //Row and Col headers
    private rowHeaderWidth: number = 50;
    private colHeaderHeight: number = 30;

    //for storing data in grid
    private dataStore: DataStore;

    //for Selection
    public selection:Selection;

    private commandManager: CommandManager;
    
    // Controllers for events
    private pointerController: PointerController;
    private keyboardController: KeyboardController;

    //Gridrender
    private renderer: GridRenderer;

    //EditManager
    private editManager: EditManager;

    //ViewPortManager
    private viewportManager: ViewportManager;

    constructor(canvasId: string, totalRows: number, totalColumns: number, dataStore: DataStore, commandManager: CommandManager) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        
        //To manage Height and Width resizing
        this.rowManager = new RowManager(totalRows);
        this.colManager = new ColumnManager(totalColumns);

        this.dataStore = dataStore;
        this.selection = new Selection();
        this.commandManager = commandManager;
        
        //Init grid renderer
        this.renderer = new GridRenderer(this.canvas, this.ctx, this.rowManager, this.colManager, this.dataStore, this.selection);

        //init EditManager
        this.editManager = new EditManager(
            this.dataStore,
            this.commandManager,
            this.rowManager,
            this.colManager,
            this.rowHeaderWidth,
            this.colHeaderHeight,
            () => this.drawGrid()
        );

        //init viewportmanager
        this.viewportManager = new ViewportManager(
            this.rowManager, 
            this.colManager, 
            this.rowHeaderWidth, 
            this.colHeaderHeight
        );

        //Input Controller
        this.pointerController = new PointerController(
            this.canvas, this.rowManager, this.colManager, this.viewportManager, 
            this.selection, this.editManager, this.commandManager, 
            this.rowHeaderWidth, this.colHeaderHeight,
            () => ({ x: this.scrollX, y: this.scrollY }), // getScroll
            () => this.drawGrid(),                        // onRedrawRequired
            () => { this.updateStatusBar(); this.updateSpacer(); } // onUIUpdateRequired
        );

        this.keyboardController = new KeyboardController(
            this.canvas, this.selection, this.editManager, this.rowManager, this.colManager,
            () => ({ x: this.scrollX, y: this.scrollY }), // getScroll
            (row, col) => this.moveSelection(row, col),   // moveSelection
            () => this.drawGrid()                         // onRedrawRequired
        );

        //handle window resize to adjust canvas size
        this.resizeCanvas();
        this.updateSpacer();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.drawGrid();
    }

    private updateSpacer(): void {
        const spacer = document.getElementById('grid-spacer') as HTMLDivElement;
        if(spacer) {
            spacer.style.width = `${this.colManager.getTotalWidth() + this.rowHeaderWidth}px`;
            spacer.style.height = `${this.rowManager.getTotalHeight() + this.colHeaderHeight}px`;
        }
    }

    private resizeCanvas(): void {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.drawGrid();
    }

    public setScroll(x: number, y: number): void {
        if (this.editManager.isEditing()) {
            this.editManager.blurEditor(); 
        }

        this.scrollX = x;
        this.scrollY = y;
        this.drawGrid();
    }

    public drawGrid(): void {
        this.renderer.drawGrid(this.scrollX,this.scrollY);
    }

    private updateStatusBar(): void {
        const statusBar = document.getElementById('summary-bar');
        if(!statusBar) return;

        if (!this.selection.isActive()) {
            statusBar!.innerText = '';
            return;
        }

        const bounds = this.selection.getSelection();

        statusBar!.innerText = SummaryCalculator.calculate(
            this.dataStore,
            bounds.minRow,
            bounds.maxRow,
            bounds.minCol,
            bounds.maxCol
        );
    }


    private ensureCellIsVisible(row: number, col:number): void{
        //call viewport to calc scroll
        const { newScrollX, newScrollY } = this.viewportManager.calcScrollToMakeCellVisible(
            row, col, this.scrollX, this.scrollY, this.canvas.width, this.canvas.height
        );
        
        this.scrollX = newScrollX;
        this.scrollY = newScrollY;

        const container = document.getElementById('grid-container') as HTMLDivElement;
        if(container){
            container.scrollLeft = this.scrollX;
            container.scrollTop = this.scrollY;
        }
    } 

    private moveSelection(row: number, col: number): void{
        this.selection.setStart(row,col);
        if (this.selection.isSelecting) {
            this.selection.finishSelecting();
        }

        this.ensureCellIsVisible(row,col);

        this.drawGrid();
        this.updateStatusBar();

        if(this.editManager.isEditing()){
            this.editManager.blurEditor();
        }
    }
}