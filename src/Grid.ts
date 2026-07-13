import { ColumnManager } from "./ColumnManager.js";
import type { CommandManager } from "./Command/CommandManager.js";
import { EditCommand } from "./Command/EditCommand.js";
import { ColumnResizeCommand, RowResizeCommand } from "./Command/ResizeCommands.js";
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

    //Resizing 
    private isResizingCol: boolean = false;
    private isResizingRow: boolean = false;
    private resizeIndex: number = -1;
    private oldSize: number = 0;
    private startMousePos: number = 0;

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

        this.startMouseEvents();

        //handle window resize to adjust canvas size
        this.resizeCanvas();
        this.updateSpacer();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.drawGrid();
    }
    //down,move and up
    private startMouseEvents() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
    
        //ESC to hide and reset Selection and commit
        window.addEventListener('keydown',(e) => {
            if(e.key === 'Escape'){
                e.preventDefault();
                this.drawGrid();
                //Commit any edited data
                if (this.editManager.isEditing()) {
                    this.editManager.blurEditor(); 
                }
            } 
            if(e.key === 'ArrowDown' ){
                 e.preventDefault();
                const {minRow, minCol} = this.selection.getSelection();
                if(minRow < this.rowManager.totalRows - 1){
                    this.moveSelection(minRow+1,minCol);
                }
            } 
            if(e.key === 'ArrowUp'){
                e.preventDefault();
                const {minRow, minCol} = this.selection.getSelection();
                console.log(`row: ${minRow}, col: ${minCol}`);
                if (minRow>0) {
                    this.moveSelection(minRow-1,minCol);
                }
            } 
            if(e.key === 'ArrowLeft' && !this.editManager.isEditing()){
                e.preventDefault();
                const {minRow, minCol} = this.selection.getSelection();
                console.log(`row: ${minRow}, col: ${minCol}`);
                if (minCol > 0) {
                    this.moveSelection(minRow, minCol - 1);
                }
            } 
            if(e.key === 'ArrowRight' && !this.editManager.isEditing()){
                e.preventDefault();
                const {minRow, minCol} = this.selection.getSelection();
                if(minRow < this.colManager.totalColumns - 1){
                    this.moveSelection(minRow, minCol + 1);
                }
            } 
        });
        //double click listener for edit cell
        this.canvas.addEventListener('dblclick',(e) => this.handleDoubleClick(e))
    }

    //For Edit cell
    public handleDoubleClick(e: MouseEvent): any {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const {row, col} = this.viewportManager.convertToCell(mouseX, mouseY, this.scrollX, this.scrollY);
        
        if (row>= 0 && col>= 0) {
            //show a dynamic input box
            this.editManager.showEditor(row,col,this.scrollX,this.scrollY,rect);
        }
    }
    
    private handleMouseDown(e: MouseEvent): void {
        let rect = this.canvas.getBoundingClientRect();
        //X and Y positions on canvas
        let mouseX = e.clientX - rect.left;
        let mouseY = e.clientY - rect.top;

        //Check if its on header
        if(mouseY < this.colHeaderHeight && this.canvas.style.cursor === 'col-resize'){
            this.isResizingCol = true;
            this.startMousePos = mouseX;
            return;
        }

        if(mouseX < this.rowHeaderWidth && this.canvas.style.cursor === 'row-resize'){
            this.isResizingRow = true;
            this.startMousePos = mouseY;
            return;
        }

        const {row, col} = this.viewportManager.convertToCell(mouseX, mouseY, this.scrollX, this.scrollY);
        // console.log(`Mouse Down Triggered on CELL ${row},${col}`);

        if(row >= 0 && col >= 0){
            this.selection.setStart(row,col);
            this.drawGrid();
            this.updateStatusBar();
        } else if(row >= 0 && col < 0 ){
            this.selection.setStart(row,0);
            this.selection.setEnd(row,this.colManager.totalColumns);
            this.drawGrid();
            this.updateStatusBar();
        } else if(row < 0 && col >= 0){
            this.selection.setStart(0,col);
            this.selection.setEnd(this.rowManager.totalRows,col);
            this.drawGrid();
            this.updateStatusBar();
        }
    }

    private handleMouseMove(e:MouseEvent): void {

        let rect = this.canvas.getBoundingClientRect();
        //X and Y positions on canvas
        let mouseX = e.clientX - rect.left;
        let mouseY = e.clientY - rect.top;

        //Col resize
        if (this.isResizingCol) {
            const diff = mouseX - this.startMousePos;
            const newWidth = Math.min(400,Math.max(50,this.oldSize + diff));
            
            this.colManager.setWidth(this.resizeIndex, newWidth);
            this.updateSpacer();
            this.drawGrid();
            return;
        }
        //Row resize
        if (this.isResizingRow) {
            const diff = mouseY - this.startMousePos;
            //newHeight considering min and max
            let newHeight = Math.min(300,Math.max(20,this.oldSize + diff));
            
            //Calling viewport for hoverboundry calc
            this.rowManager.setHeight(this.resizeIndex, newHeight);
            this.updateSpacer();
            this.drawGrid();
            return;
        }

        const boundary = this.viewportManager.getHoveredResizeBoundary(
            mouseX, 
            mouseY, 
            this.scrollX, 
            this.scrollY, 
            this.canvas.width, 
            this.canvas.height
        );

        if (boundary.type === 'col') {
            this.canvas.style.cursor = 'col-resize'; 
            this.resizeIndex = boundary.index;             
            this.oldSize = boundary.oldSize; 
        } else if (boundary.type === 'row') {
            this.canvas.style.cursor = 'row-resize';
            this.resizeIndex = boundary.index;
            this.oldSize = boundary.oldSize;
        } else {
            //Normal header will have pointer
            if ((mouseX > this.rowHeaderWidth && mouseY < this.colHeaderHeight) || 
                (mouseX < this.rowHeaderWidth && mouseY > this.colHeaderHeight)) {
                this.canvas.style.cursor = 'pointer';
            } else {
                this.canvas.style.cursor = 'default';
            }
            this.resizeIndex = -1;
        }

        
        if (this.selection.isSelecting && !this.isResizingCol && !this.isResizingRow) {
            const {row, col} = this.viewportManager.convertToCell(mouseX, mouseY, this.scrollX, this.scrollY);            //console.log(`Mouse MOVE Triggered on CELL ${row},${col}`);
            if(row >= 0 && col >= 0){
                //if new cell
                if (this.selection.endRow !== row || this.selection.endCol !== col) {
                    this.selection.setEnd(row,col);
                    this.drawGrid();
                    this.updateStatusBar();
                }
            }
        }
    }


    private handleMouseUp(): void {
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
        if(this.isResizingRow){
            this.isResizingRow = false;
            const finalHeight = this.rowManager.getHeight(this.resizeIndex);
            if(finalHeight !== this.oldSize) {
                const command = new RowResizeCommand(this.rowManager, this.resizeIndex, this.oldSize,finalHeight);
                this.commandManager.executeCommand(command);
            }
        }

        
        if (this.selection.isSelecting) {
            this.selection.finishSelecting();
        }
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

        const result = SummaryCalculator.calculate(
            this.dataStore,
            bounds.minRow,
            bounds.maxRow,
            bounds.minCol,
            bounds.maxCol
        );

        statusBar!.innerText = result
    }


    private ensureCellIsVisible(row: number, col:number): void{
        //call viewport to calc scroll
        const { newScrollX, newScrollY } = this.viewportManager.calcScrollToMakeCellVisible(
            row, col, this.scrollX, this.scrollY, this.canvas.width, this.canvas.height
        );
        
        this.scrollX = newScrollX;
        this.scrollY = newScrollY;

        const container = document.getElementById('grid-container') as HTMLDivElement;
        container.scrollLeft = this.scrollX;
        container.scrollTop = this.scrollY;
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