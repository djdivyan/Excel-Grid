import type { ColumnManager } from "../ColumnManager.js";
import type { Command } from "../interfaces/Command.js";
import type { RowManager } from "../RowManager.js";

export class ColumnResizeCommand implements Command {
    constructor(
        private colManager: ColumnManager,
        private colIndex: number,
        private oldColWidth: number,
        private newColWidth:number
    ) {  }
    
    public execute(): void {
        this.colManager.setWidth(this.colIndex,this.newColWidth);
    }
    public undo(): void {
        this.colManager.setWidth(this.colIndex,this.oldColWidth);
    }
}

export class RowResizeCommand implements Command {
    constructor(
        private rowManager: RowManager,
        private rowIndex: number,
        private oldRowHeight: number,
        private newRowHeight:number
    ) {  }
    
    public execute(): void {
        this.rowManager.setHeight(this.rowIndex,this.newRowHeight);
    }
    public undo(): void {
        this.rowManager.setHeight(this.rowIndex,this.oldRowHeight);
    }
}