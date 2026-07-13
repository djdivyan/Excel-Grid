import type { ColumnManager } from "./ColumnManager.js";
import type { RowManager } from "./RowManager.js";

export class ViewportManager {
    
    constructor(
        private rowManager: RowManager,
        private colManager: ColumnManager,
        private rowHeaderWidth: number,
        private colHeaderHeight: number
    ) {}

    //converting mouse x,y to row,col 
    public convertToCell(x: number, y: number, scrollX: number, scrollY: number): { row: number, col: number } {
        //find column
        let currentX = 0;
        let colIdx = 0;
        //new X considering scroll and headers
        let newX = x - this.rowHeaderWidth + scrollX;

        //check header click
        if (x < this.rowHeaderWidth) {
            colIdx = -1;
        } else {
            while (currentX <= newX && colIdx < this.colManager.totalColumns) {
                currentX += this.colManager.getWidth(colIdx);
                if (currentX > newX) break;
                colIdx++;
            }
        }

        //find row
        let currentY = 0;
        let rowIdx = 0;
        
        //new Y considering scroll and headers
        let newY = y - this.colHeaderHeight + scrollY;

        // check header click
        if (y < this.colHeaderHeight) {
            rowIdx = -1;
        } else {
            while (currentY <= newY && rowIdx < this.rowManager.totalRows) {
                currentY += this.rowManager.getHeight(rowIdx);
                if (currentY > newY) break;
                rowIdx++;
            }
        }

        return { row: rowIdx, col: colIdx };
    }

    //resize hover detection in mouse events
    public getHoveredResizeBoundary(mouseX: number, mouseY: number, scrollX: number, scrollY: number, canvasWidth: number, canvasHeight: number): { type: 'col' | 'row' | 'none', index: number, oldSize: number } {
        
        //for column header hover
        if (mouseX > this.rowHeaderWidth && mouseY < this.colHeaderHeight) {
            let currentX = 0;
            let colIndex = 0;

            while (currentX - scrollX <= canvasWidth && colIndex < this.colManager.totalColumns) {
                //visible onscreen
                if (currentX + this.colManager.getWidth(colIndex) >= scrollX) {
                    let rightEdge = (currentX - scrollX) + this.rowHeaderWidth + this.colManager.getWidth(colIndex);
                    //check mouse within 4 px of edge
                    if (Math.abs(mouseX - rightEdge) < 4) {
                        return { type: 'col', index: colIndex, oldSize: this.colManager.getWidth(colIndex) };
                    }
                }
                currentX += this.colManager.getWidth(colIndex);
                colIndex++;
            }
        }

         //row header hover
        if (mouseX < this.rowHeaderWidth && mouseY > this.colHeaderHeight) {
            let currentY = 0;
            let rowIndex = 0;

            while (currentY - scrollY <= canvasHeight && rowIndex < this.rowManager.totalRows) {
                if (currentY + this.rowManager.getHeight(rowIndex) >= scrollY) {
                    let bottomEdge = (currentY - scrollY) + this.colHeaderHeight + this.rowManager.getHeight(rowIndex);
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

    //scroll for arrow navigation
    public calcScrollToMakeCellVisible( row: number, col: number, currentScrollX: number, currentScrollY: number, canvasWidth: number, canvasHeight: number ): { newScrollX: number, newScrollY: number } {
        
        //getting the X,Y,Height,width for cell top left corner
        let x = 0;
        for (let i = 0; i < col; i++) x += this.colManager.getWidth(i);
        
        let y = 0;
        for (let i = 0; i < row; i++) y += this.rowManager.getHeight(i);

        const height = this.rowManager.getHeight(row);
        const width = this.colManager.getWidth(col);

        //space available for cells
        const visibleWidth = canvasWidth - this.rowHeaderWidth;
        const visibleHeight = canvasHeight - this.colHeaderHeight;

        let newScrollX = currentScrollX;
        let newScrollY = currentScrollY;

        //cell hidden to the left
        if (x < currentScrollX) {
            newScrollX = x;
        } 
        //cell hidden to the right
        else if (x + width > currentScrollX + visibleWidth) {
            //+17 for scroll bars
            newScrollX = x + width - visibleWidth + 17;
        }

        //cell hidden above
        if (y < currentScrollY) {
            newScrollY = y;
        } 
        //cell hidden below
        else if (y + height > currentScrollY + visibleHeight - 45) {
            newScrollY = y + height - visibleHeight + 45; 
        }
        return { newScrollX, newScrollY };
    }
}