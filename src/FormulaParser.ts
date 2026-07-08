import type { DataStore } from "./DataStore.js";

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
        //func, startCol,startRow:endCol,endRow
        const match = formula.match(/^=([A-Z]+)\(([A-Z]+)(\d+):([A-Z]+)(\d+)\)$/i);

        console.log(match);
        if (!match) return "#ERROR";

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

        //execute the requested function
        switch(func!.toUpperCase()) {
            case 'SUM': 
                return values.reduce((a, b) => a + b, 0);
            case 'COUNT': 
                return values.length;
            case 'MAX': 
                return values.length ? Math.max(...values) : 0;
            case 'MIN': 
                return values.length ? Math.min(...values) : 0;
            default: 
                return "#NotRecognised?";
        }
    }
}