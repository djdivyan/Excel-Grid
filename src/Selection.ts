export class Selection {
    public startRow: number = -1;
    public endRow: number = -1;
    public startCol: number = -1;
    public endCol: number = -1;
    public isSelecting:boolean = false;

    //Called on mouseDown 
    public setStart(row:number, col:number) {
        this.startRow = row;
        this.startCol = col;
        this.endRow = row;
        this.endCol = col;
        this.isSelecting = true;   
    }

    //Called on mouseMove
    public setEnd(endRow:number, endCol:number) {
        this.endRow = endRow;
        this.endCol = endCol; 
    }

    //Called on mouseUp
    public finishSelecting(){
        this.isSelecting = false;
    }

    //returning selection, handling both up or down drag scenario    
    public getSelection(): { minRow: number, maxRow: number, minCol: number, maxCol: number } {
        return {
            minRow: Math.min(this.startRow, this.endRow),
            maxRow: Math.max(this.startRow, this.endRow),
            minCol: Math.min(this.startCol, this.endCol),
            maxCol: Math.max(this.startCol, this.endCol)
        };
    }


    public isActive(): boolean {
        return this.startRow !== -1 && this.startCol !== -1;
    }

}