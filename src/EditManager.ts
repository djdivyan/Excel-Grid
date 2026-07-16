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

    private currentSuggestions: string[] = [];
    private suggestionIndex: number = -1;

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
            const hasPopup = document.getElementById('suggestion') !== null;

            if (e.key === 'ArrowDown' && hasPopup) {
                e.preventDefault(); 
                e.stopPropagation();
                if (this.suggestionIndex < this.currentSuggestions.length - 1) {
                    this.suggestionIndex++;
                    this.updateSuggestionHighlight();
                }
            } 
            else if (e.key === 'ArrowUp' && hasPopup) {
                e.preventDefault(); 
                e.stopPropagation();
                if (this.suggestionIndex > 0) {
                    this.suggestionIndex--;
                    this.updateSuggestionHighlight();
                }
            } 
            else if (e.key === 'Enter') {
                if (hasPopup && this.suggestionIndex >= 0) {
                    e.preventDefault();
                    this.activeInput!.value = `=${this.currentSuggestions[this.suggestionIndex]}`;
                    this.removeSuggestionPopup();
                } else {
                    e.stopPropagation();
                    this.commit(row, col, oldValue);
                }
            }

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
        
        const val = ["COUNT(A1:B3)", "MIN(A1:B3)", "MAX(A1:B3)", "SUM(A1:B3)"];
        let formulas = val.filter(v => v.includes(input.value.slice(1).toUpperCase()));
        
        if (formulas.length <= 0) {
            formulas = val;
        }
        //Saving formulas in class state for navigation
        this.currentSuggestions = formulas;
        this.suggestionIndex = -1;

        const suggestion = document.createElement('div');
        suggestion.id = 'suggestion';
        suggestion.style.position = 'fixed';
        suggestion.style.left = input.style.left;
        suggestion.style.top = `calc(${input.style.top} + ${input.style.height})`;
        suggestion.style.width = input.style.width;
        suggestion.style.zIndex = "21"; 
        suggestion.style.backgroundColor = GridConfig.colors.editorBackground;
        suggestion.style.border = "1px solid #cccccc";
        suggestion.style.borderRadius = "6px";
        suggestion.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
        suggestion.style.padding = "4px";

        const ul = document.createElement('ul');
        ul.style.listStyle = 'none';
        ul.style.margin = '0';
        ul.style.padding = '4px 0';


         for (let i = 0; i < formulas.length; i++) {
            const formula = formulas[i]!;
            const li = document.createElement('li');
            li.id = `suggestion-item-${i}`;
            li.innerText = formula;
            li.style.padding = '6px 10px';
            li.style.cursor = 'pointer';
            li.style.borderRadius = '4px';
            li.style.fontFamily = 'sans-serif';
            li.style.fontSize = '13px';
            
            //Mouse hover handling
            li.onmouseenter = () => {
                this.suggestionIndex = i;
                this.updateSuggestionHighlight();
            };
            
            //Mouse click handling
            li.onpointerdown = (e) => {
                e.preventDefault(); 
                input.value = `=${formula}`;
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

        this.currentSuggestions = [];
        this.suggestionIndex = -1;
    }

    private updateSuggestionHighlight(): void {
        for (let i = 0; i < this.currentSuggestions.length; i++) {
            const li = document.getElementById(`suggestion-item-${i}`);
            if (li) {
                if (i === this.suggestionIndex) {
                    //Highlight selected item
                    li.style.backgroundColor = '#e8f0fe'; 
                    li.style.color = '#1a73e8';
                } else {
                    //Reset unselected items
                    li.style.backgroundColor = 'transparent';
                    li.style.color = '#000';
                }
            }
        }
    }
}