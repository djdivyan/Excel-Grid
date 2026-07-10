import type { Cell } from "./Cell.js";
import type { ColumnManager } from "./ColumnManager.js";
import type { CommandManager } from "./Command/CommandManager.js";
import { EditCommand } from "./Command/EditCommand.js";
import { GridConfig } from "./config/GridConfig.js";
import type { DataStore } from "./DataStore.js";
import type { RowManager } from "./RowManager.js";

export class EditManager {
    private activeInput: HTMLInputElement | null = null;
    private isFormula: boolean  = false;
    private isCommitted: boolean = false; 

    constructor(
        private dataStore: DataStore,
        private commandManager: CommandManager,
        private rowManager: RowManager,
        private colManager: ColumnManager,
        private rowHeaderWidth: number,
        private colHeaderHeight: number,
        private onRedrawRequired: () => void
    ) { }


    public isEditing(): boolean {
        return this.activeInput !== null;
    }

    public blurEditor(): void {
        if (this.activeInput) {
            this.activeInput.blur();
        }
    }

    public showEditor(row: number, col: number,scrollX: number, scrollY: number, canvasRect: DOMRect): void{
        //getting the X,Y,Height,width to get the size for input box 
        let x = 0;
        for (let i = 0; i < col; i++){
            x += this.colManager.getWidth(i);
        } 

        let y = 0;
        for (let i = 0; i < row; i++) {
            y += this.rowManager.getHeight(i);
        }

        const height = this.rowManager.getHeight(row);
        const width = this.colManager.getWidth(col);

        //wrt to canvas
        const visualX = (x - scrollX) + this.rowHeaderWidth;
        const visualY = (y - scrollY) + this.colHeaderHeight;

        //creating input element
        const input = document.createElement('input');

        //Match styling with cell
        input.style.position = 'fixed'; 
        input.style.backgroundColor = "#fff";
        input.style.color = "#000";
        input.style.opacity = "1";
        input.style.zIndex = "20";
        input.style.border = '2px solid #095303';
        input.style.outline = 'none';
        input.style.font = '14px sans-serif';
        input.style.padding = '0 4px';
        input.style.boxSizing = 'border-box';

        //wrt to the windows viewport considering canvas location
        input.style.left = `${canvasRect.left + visualX}px`;
        input.style.top = `${canvasRect.top + visualY}px`;
        input.style.height = `${height}px`;
        input.style.width = `${width}px`

        const existingCell: Cell | undefined = this.dataStore.getCell(row, col);
        const oldValue: string | number = existingCell ? existingCell.value.toString() : '';
        input.value = oldValue;

        document.body.appendChild(input);
        input.focus();
        this.activeInput = input;

        //Saving
        this.isCommitted = false;
        this.registerEventListeners(row,col,oldValue);

        
    }

    private registerEventListeners(row: number, col: number, oldValue: string | number){
        this.activeInput!.addEventListener('blur', () => this.commit(row,col,oldValue));
        
        this.activeInput!.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.commit(row,col,oldValue);
            if (e.key === 'Escape') {
                //Prevent data from being committed
                this.isCommitted = true; 
                this.activeInput!.remove();
                this.activeInput = null;
                this.removeSuggestionPopup();
                this.onRedrawRequired();
            }
        });
            
        this.activeInput!.addEventListener('input', () => {
            this.handleFormulaInput(this.activeInput!.value);
            this.showSuggestionPopup(this.activeInput!);
        });

        //TODO: pop-up navigation
        this.activeInput!.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                
                
            } else if(e.key === 'ArrowUp') {

            }
        });

    
    }


    private commit(row: number,col: number,oldValue: string | number): void{
            if (this.isCommitted) return;
            this.isCommitted = true;

            const newValue = this.activeInput!.value;
            if (oldValue !== newValue) {
                const editCommand = new EditCommand(this.dataStore,row,col,newValue,oldValue);
                this.commandManager.executeCommand(editCommand);

                //redraw updated data
                this.dataStore.recalculateAll();
                this.onRedrawRequired();
            }

            this.activeInput!.remove();
            this.activeInput = null;
            this.removeSuggestionPopup();
    }

    private handleFormulaInput(input: string): void {
        this.isFormula = input.startsWith('=');
    }

    private showSuggestionPopup(input: HTMLInputElement): void {
        this.removeSuggestionPopup();

        if(!this.isFormula) return;

        const suggestion = document.createElement('div');
        suggestion.id = 'suggestion';
        suggestion.style.position = 'fixed';
        suggestion.style.left = input.style.left;
        suggestion.style.top = `calc(${input.style.top} + ${input.style.height})`;
        suggestion.style.width = input.style.width;
        suggestion.style.zIndex = "21"; 
        suggestion.style.backgroundColor = GridConfig.colors.editorBackground;
        suggestion.style.border = "1px solid #cccccc";

        const ul = document.createElement('ul');
        ul.style.listStyle = 'none';
        ul.style.margin = '0';
        ul.style.padding = '4px 0';

        const val = ["COUNT(A1:B3)", "MIN(A1:B3)", "MAX(A1:B3)", "SUM(A1:B3)"];
        let formulas = val.filter(v => v.includes(input.value.slice(1).toUpperCase()));
        
        if (formulas.length <= 0) {
            formulas = val;
        }

        for (const formula of formulas) {
            const li = document.createElement('li');
            li.id = formula;
            li.innerText = formula;
            li.style.padding = '4px 8px';
            li.style.cursor = 'pointer';
            
            li.onmousedown = (e) => {
                e.preventDefault(); 
                input.value = `=${li.innerText}`;
                this.removeSuggestionPopup();
            };
            ul.appendChild(li);
        }
    
        suggestion.appendChild(ul);
        document.body.appendChild(suggestion);
    }

    private removeSuggestionPopup(): void {
        const existingPopup = document.getElementById('suggestion');
        if (existingPopup) existingPopup.remove();
    }
}