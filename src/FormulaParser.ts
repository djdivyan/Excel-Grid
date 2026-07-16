import type { DataStore } from "./DataStore.js";
import { FormulaFactory } from "./Formulas/FormulaFactory.js";

export class FormulaParser {
    private static colNameToIndex(letters: string): number {
        let index = 0;
        for(let i = 0; i < letters.length; i++){
            index = index * 26 + ( letters.charCodeAt(i) - 64 );
        }
        index--;
        return index ?? -1;
    }

    public  static evaluate(formula: string, dataStore: DataStore){
        if(typeof formula !== 'string' || !formula.startsWith('=')){
            return formula;
        }
        
        const originalText = formula;
        formula = formula.split(" ").join("");
        
        //func, startCol,startRow:endCol,endRow
        const match = formula.match(/^=([A-Z]+)\(([A-Z]+)(\d+):([A-Z]+)(\d+)\)$/i);

        console.log(match);
        if (!match) return originalText;

        const [,func,startColStr,startRowStr,endColStr,endRowStr] = match;

        const startCol = this.colNameToIndex(startColStr!.toUpperCase());
        const endCol = this.colNameToIndex(endColStr!.toUpperCase());
        const startRow = parseInt(startRowStr!) - 1;
        const endRow = parseInt(endRowStr!) - 1;

        let values: number[] = [];

        for(let r = Math.min(startRow, endRow); r <= Math.max(startRow, endRow); r++) {
            for(let c = Math.min(startCol, endCol); c <= Math.max(startCol, endCol); c++) {
                const cell = dataStore.getCell(r, c);
                if (cell && !isNaN(Number(cell.displayValue))) {
                    values.push(Number(cell.displayValue));
                }
            }
        }

        console.log(values);
        // Using factory delegate to get object of function of particular formula then execute
        const mathFunction = FormulaFactory.getFunction(func!);
        
        if (mathFunction) {
            //execute the requested function
            return mathFunction.execute(values);
        } else {
            return "#NotRecognised?";
        }
    }
}