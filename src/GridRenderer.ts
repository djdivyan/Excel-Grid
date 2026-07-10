import type { ColumnManager } from "./ColumnManager.js";
import { GridConfig } from "./config/GridConfig.js";
import type { DataStore } from "./DataStore.js";
import type { RowManager } from "./RowManager.js";
import type { Selection } from "./Selection.js";

export class GridRenderer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private rowHeaderWidth: number = GridConfig.dimensions.rowHeaderWidth;
    private colHeaderHeight: number = GridConfig.dimensions.colHeaderHeight;

    constructor(canvas: HTMLCanvasElement,
        ctx: CanvasRenderingContext2D,
        private rowManager: RowManager,
        private colManager: ColumnManager,
        private dataStore: DataStore,
        private selection: Selection
    ) { 
        this.canvas = canvas;
        this.ctx = ctx;
    }

    public drawGrid(scrollX: number, scrollY: number): void {
        //clearing the canvas for scrolling redraw
        this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);

        //First Draw lines, then fill data, then header bg and header text
        this.ctx.beginPath();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = GridConfig.colors.gridLine;

        //Skip cols and rows that are not visible
        //skip columns
        let currentX = 0;
        let colIndex = 0;
        
        while (currentX + this.colManager.getWidth(colIndex) < scrollX) {
            currentX += this.colManager.getWidth(colIndex);
            colIndex++;
        }

        //skip rows
        let currentY = 0;
        let rowIndex = 0;

        while (currentY + this.rowManager.getHeight(rowIndex) < scrollY) {
            currentY += this.rowManager.getHeight(rowIndex);
            rowIndex++;
        }

        //console.log(`Skipped to row ${rowIndex} and col ${colIndex}`)

        //Start with colIndex that will be visible
        //vertical lines
        //stop if currentX moves out of canvas width or exceeds total columns
        let tempX = currentX;
        let tempColIndex = colIndex;
    
        while (tempX - scrollX <= this.canvas.width && tempColIndex < this.colManager.totalColumns) {
            let colX = (tempX - scrollX) + this.rowHeaderWidth; 
            this.ctx.moveTo(colX, this.colHeaderHeight);
            this.ctx.lineTo(colX, this.canvas.height);
            
            tempX += this.colManager.getWidth(tempColIndex);
            tempColIndex++;
        }


        //horizontal lines
        let tempY = currentY;
        let tempRowIndex = rowIndex;
        while(tempY - scrollY <= this.canvas.height && tempRowIndex < this.rowManager.totalRows){
            let rowY = tempY - scrollY + this.colHeaderHeight;
            this.ctx.moveTo(this.rowHeaderWidth, rowY)
            this.ctx.lineTo(this.canvas.width, rowY);
            
            tempY += this.rowManager.getHeight(tempRowIndex);
            tempRowIndex++;
        }
        this.ctx.stroke();

        //Filling data in cells
        this.ctx.fillStyle = GridConfig.colors.cellText;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        this.ctx.font = GridConfig.fonts.cell;

        //Filling Row Wise
        let tempDataY = currentY;
        let tempDataRowIdx = rowIndex;
        while (tempDataY - scrollY <= this.canvas.height && tempDataRowIdx < this.rowManager.totalRows) {
            let rowHeight = this.rowManager.getHeight(tempDataRowIdx);
            let rowY = (tempDataY - scrollY) + this.colHeaderHeight;
            
            let tempDataX = currentX;
            let tempDataColIdx = colIndex;
            while (tempDataX - scrollX <= this.canvas.width && tempDataColIdx < this.colManager.totalColumns) {
                let colWidth = this.colManager.getWidth(tempDataColIdx);
                let colX = (tempDataX - scrollX) + this.rowHeaderWidth;

                const cell = this.dataStore.getCell(tempDataRowIdx,tempDataColIdx);

                if (cell) {
                    //textCliping
                    this.ctx.save(); 
                    this.ctx.beginPath();
                    this.ctx.rect(colX, rowY, colWidth, rowHeight); 
                    this.ctx.clip();
                    
                    this.ctx.fillText(cell.displayValue.toString(), colX+5, rowY+(rowHeight/2));
                    
                    this.ctx.restore();
                }

                tempDataX += colWidth;
                tempDataColIdx++;
            }

            tempDataY += rowHeight;
            tempDataRowIdx++;
        }

        if (this.selection.isActive()) {
            const bounds = this.selection.getSelection();
            
            let selX = 0;
            for (let i = 0; i < bounds.minCol; i++) selX += this.colManager.getWidth(i);
            
            let selY = 0;
            for (let i = 0; i < bounds.minRow; i++) selY += this.rowManager.getHeight(i);

            let selW = 0;
            for (let i = bounds.minCol; i <= bounds.maxCol; i++) selW += this.colManager.getWidth(i);
            
            let selH = 0;
            for (let i = bounds.minRow; i <= bounds.maxRow; i++) selH += this.rowManager.getHeight(i);

            const visualSelX = (selX - scrollX) + this.rowHeaderWidth;
            const visualSelY = (selY - scrollY) + this.colHeaderHeight;

            //Translucent Green
            //15% opacity green
            this.ctx.fillStyle = GridConfig.colors.selectionBackground; 
            this.ctx.fillRect(visualSelX, visualSelY, selW, selH);

            //Solid border line
            this.ctx.strokeStyle = GridConfig.colors.selectionBorder; 
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(visualSelX, visualSelY, selW, selH);
        }

        //Create header Background 
        this.ctx.strokeStyle = GridConfig.colors.gridLine;
        this.ctx.fillStyle = GridConfig.colors.headerBackground;
        this.ctx.fillRect(0,0,this.canvas.width, this.colHeaderHeight);
        this.ctx.fillRect(0,0,this.rowHeaderWidth, this.canvas.height);

        //header txt
        this.ctx.fillStyle = GridConfig.colors.headerText;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.font = GridConfig.fonts.cell;

        //Col headers Names filling
        let tempHeaderX = currentX;
        let tempColHeaderIndex = colIndex;
    
        while (tempHeaderX - scrollX <= this.canvas.width && tempColHeaderIndex < this.colManager.totalColumns) {
            let width = this.colManager.getWidth(tempColHeaderIndex);
            let colX = (tempHeaderX - scrollX) + this.rowHeaderWidth; 
            
            this.ctx.fillText(this.generateColNames(tempColHeaderIndex),colX+(width/2),this.colHeaderHeight/2);
            this.ctx.strokeRect(colX,0,width,this.colHeaderHeight);
            
            tempHeaderX += width;
            tempColHeaderIndex++;
        }


        //row headers Names filling
        let tempHeaderY = currentY;
        let tempRowHeaderIndex = rowIndex;
        while(tempHeaderY - scrollY <= this.canvas.height && tempRowHeaderIndex < this.rowManager.totalRows){
            let height = this.rowManager.getHeight(tempRowHeaderIndex);
            let rowY = tempHeaderY - scrollY + this.colHeaderHeight;
            
            this.ctx.fillText(`${tempRowHeaderIndex + 1}`,this.rowHeaderWidth/2,rowY+(height/2))
            this.ctx.strokeRect(0,rowY,this.rowHeaderWidth,height);
            
            tempHeaderY += height;
            tempRowHeaderIndex++;
        }

        //Dark top left corner
        this.ctx.fillStyle = GridConfig.colors.headerCorner;
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