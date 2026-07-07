import type { DataStore } from "../DataStore.js";
import type { Command } from "../interfaces/Command.js";

export class EditCommand implements Command {
    constructor(
        private dataStore:DataStore,
        private row:number, 
        private col:number,
        private newValue: string|number, 
        private oldValue:string|number
    ) {}
    
    public execute(): void {
        this.dataStore.setCell(this.row,this.col,this.newValue);
    }
    
    public undo(): void {
        this.dataStore.setCell(this.row,this.col,this.oldValue);
    }     
}