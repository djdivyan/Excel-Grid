import { ColumnManager } from "./ColumnManager.js";
import type { DataStore } from "./DataStore.js";
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

    //Row and Col headers
    private rowHeaderWidth: number = 50;
    private colHeaderHeight: number = 30;

    //for storing data in grid
    private dataStore: DataStore;


    constructor(canvasId: string, totalRows: number, totalColumns: number, dataStore: DataStore) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        
        //To manage Height and Width resizing
        this.rowManager = new RowManager(totalRows);
        this.colManager = new ColumnManager(totalColumns);
        
        this.dataStore = dataStore;

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
        this.scrollX = x;
        this.scrollY = y;
        this.drawGrid();
    }

    public drawGrid(): void {
        //clearing the canvas for scrolling redraw
        this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);

        //First Draw lines, then fill data, then header bg and header text

        this.ctx.beginPath();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = '#e0e0e0';

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
        let tempX = currentX;
        let tempColIndex = colIndex;
    
        while (tempX - this.scrollX <= this.canvas.width && tempColIndex < this.colManager.totalColumns) {
            let colX = (tempX - this.scrollX) + this.rowHeaderWidth; 
            this.ctx.moveTo(colX, this.colHeaderHeight);
            this.ctx.lineTo(colX, this.canvas.height);
            
            tempX += this.colManager.getWidth(tempColIndex);
            tempColIndex++;
        }


        //horizontal lines
        let tempY = currentY;
        let tempRowIndex = rowIndex;
        while(tempY - this.scrollY <= this.canvas.height && tempRowIndex < this.rowManager.totalRows){
            let rowY = tempY - this.scrollY + this.colHeaderHeight;
            this.ctx.moveTo(this.rowHeaderWidth, rowY)
            this.ctx.lineTo(this.canvas.width, rowY);
            
            tempY += this.rowManager.getHeight(tempRowIndex);
            tempRowIndex++;
        }
        this.ctx.stroke();

        //Filling data in cells
        this.ctx.fillStyle = '#000000';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        this.ctx.font = '14px sans-serif';

        //Filling Row Wise
        let tempDataY = currentY;
        let tempDataRowIdx = rowIndex;
        while (tempDataY - this.scrollY <= this.canvas.height && tempDataRowIdx < this.rowManager.totalRows) {
            let rowHeight = this.rowManager.getHeight(tempDataRowIdx);
            let rowY = (tempDataY - this.scrollY) + this.colHeaderHeight;
            
            let tempDataX = currentX;
            let tempDataColIdx = colIndex;
            while (tempDataX - this.scrollX <= this.canvas.width && tempDataColIdx < this.colManager.totalColumns) {
                let colWidth = this.colManager.getWidth(tempDataColIdx);
                let colX = (tempDataX - this.scrollX) + this.rowHeaderWidth;

                const cell = this.dataStore.getCell(tempDataRowIdx,tempDataColIdx);

                if (cell) {
                    //textCliping
                    this.ctx.save(); 
                    this.ctx.beginPath();
                    this.ctx.rect(colX, rowY, colWidth, rowHeight); 
                    this.ctx.clip();
                    
                    this.ctx.fillText(cell.value.toString(), colX+5, rowY+(rowHeight/2));
                    
                    this.ctx.restore();
                }

                tempDataX += colWidth;
                tempDataColIdx++;
            }

            tempDataY += rowHeight;
            tempDataRowIdx++;
        }


        //Create header Background 
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0,0,this.canvas.width, this.colHeaderHeight);
        this.ctx.fillRect(0,0,this.rowHeaderWidth, this.canvas.height);

        //header txt
        this.ctx.fillStyle = "#333333";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.font = '14px sans-serif'

        //Col headers Names filling
        let tempHeaderX = currentX;
        let tempColHeaderIndex = colIndex;
    
        while (tempHeaderX - this.scrollX <= this.canvas.width && tempColHeaderIndex < this.colManager.totalColumns) {
            let width = this.colManager.getWidth(tempColHeaderIndex);
            let colX = (tempHeaderX - this.scrollX) + this.rowHeaderWidth; 
            
            this.ctx.fillText(this.generateColNames(tempColHeaderIndex),colX+(width/2),this.colHeaderHeight/2);
            this.ctx.strokeRect(colX,0,width,this.colHeaderHeight);
            
            tempHeaderX += width;
            tempColHeaderIndex++;
        }


        //row headers Names filling
        let tempHeaderY = currentY;
        let tempRowHeaderIndex = rowIndex;
        while(tempHeaderY - this.scrollY <= this.canvas.height && tempRowHeaderIndex < this.rowManager.totalRows){
            let height = this.rowManager.getHeight(tempRowHeaderIndex);
            let rowY = tempHeaderY - this.scrollY + this.colHeaderHeight;
            
            this.ctx.fillText(`${tempRowHeaderIndex + 1}`,this.rowHeaderWidth/2,rowY+(height/2))
            this.ctx.strokeRect(0,rowY,this.rowHeaderWidth,height);
            
            tempHeaderY += height;
            tempRowHeaderIndex++;
        }

        //Dark top left corner
        this.ctx.fillStyle = '#e8eaed';
        this.ctx.fillRect(0,0,this.rowHeaderWidth,this.colHeaderHeight);

    }

    private generateColNames(colNumber: number): string {
        let colName = '';
        let n = colNumber + 1; 

        while (n > 0) {
            colName = String.fromCharCode(65 + ((n - 1) % 26)) + colName;
            n = Math.floor((n - ((n - 1) % 26)) / 26);
        }
        // console.log(`Col: ${colNumber} Name: ${colName}`);
        return colName;
    }
}