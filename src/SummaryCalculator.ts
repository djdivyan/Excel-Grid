import type { DataStore } from "./DataStore.js";

export class SummaryCalculator {
    public static calculate(dataStore: DataStore, minRow: number, maxRow: number, minCol: number,maxCol:number): string {
        let count = 0;
        let sum = 0;
        let min = Infinity;
        let max = -Infinity;

        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                const cell = dataStore.getCell(r,c);

                if(cell && cell.displayValue !== undefined && cell.displayValue !== null && cell.displayValue !== ''){
                    const numValue = Number(cell.displayValue);

                    if(!isNaN(numValue)){
                        count++;
                        sum += numValue;
                        if (numValue < min) min = numValue;
                        if(numValue > max) max = numValue;
                    }
                }
            } 
        }

        if(count === 0){
            return '';
        }
        const avg = sum / count;
        
        return `Count:${count}   Average:${avg.toFixed(2)}   Sum:${sum}   Min:${min}   Max:${max}`;
    }
}