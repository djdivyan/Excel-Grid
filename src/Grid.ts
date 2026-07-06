import { ColumnManager } from "./ColumnManager.js";
import { RowManager } from "./RowManager.js";

export class Grid {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private cellSize: number = 50;
    
    private rowManager: RowManager;
    private colManager: ColumnManager;

    //Defualt is 0 when page loads, Updated when user scrolls
    private scrollX: number = 0;
    private scrollY: number = 0;

    constructor(canvasId: string, totalRows: number, totalColumns: number) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        
        //To manage Height and Width resizing
        this.rowManager = new RowManager(totalRows);
        this.colManager = new ColumnManager(totalColumns);

        //handle window resize to adjust canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.drawGrid();
    }

    private resizeCanvas(): void {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.drawGrid();
    }

    public setScroll(x: number, y: number): void {
        this.scrollX = x;
        this.scrollY = y;
        this.drawGrid();
    }

    public drawGrid(): void {
        //clearing the canvas for scrolling redraw
        this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);

        this.ctx.beginPath();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = '#b8b8b8';

        //Skip cols and rows that are not visible
        //skip columns
        let currentX = 0;
        let colIndex = 0;

        while (currentX + this.colManager.getWidth(colIndex) < this.scrollX) {
            currentX += this.colManager.getWidth(colIndex);
            colIndex++;
        }

        //skip rows
        let currentY = 0;
        let rowIndex = 0;

        while (currentY + this.rowManager.getHeight(rowIndex) < this.scrollY) {
            currentY += this.rowManager.getHeight(rowIndex);
            rowIndex++;
        }

        console.log(`Skipped to row ${rowIndex} and col ${colIndex}`)

        //Start with colIndex that will be visible
        //vertical lines
        //stop if currentX moves out of canvas width or exceeds total columns
        while (currentX - this.scrollX <= this.canvas.width && colIndex < this.colManager.totalColumns) {
            let colX = currentX - this.scrollX;
            this.ctx.moveTo(colX, 0);
            this.ctx.lineTo(colX, this.canvas.height);
            
            currentX += this.colManager.getWidth(colIndex);
            colIndex++;
        }


        //horizontal lines
        while(currentY - this.scrollY <= this.canvas.height && rowIndex < this.rowManager.totalRows){
            let rowY = currentY - this.scrollY;
            this.ctx.moveTo(0, rowY)
            this.ctx.lineTo(this.canvas.width, rowY);
            
            currentY += this.rowManager.getHeight(rowIndex);
            rowIndex++;
        }
        this.ctx.stroke();
    }
}