import { Cell } from "./Cell.js";
import { FormulaParser } from "./FormulaParser.js";
import type { IEmployee } from "./interfaces/IEmployee.js";

export class DataStore {
    //key will be row,col
    private cells: Map<string, Cell> = new Map();

    public setCell(row:number, col:number, value: string | number): void {
        this.cells.set(`${row},${col}`,new Cell(value));
    }

    public recalculateAll(): void {
        this.cells.forEach((cell) => {
            if (typeof cell.value === 'string' && cell.value.startsWith('=')) {
                cell.displayValue = FormulaParser.evaluate(cell.value, this);
            } else {
                cell.displayValue = cell.value;
            }
        });
    }

    public getCell(row:number, col:number): Cell | undefined{
        return this.cells.get(`${row},${col}`);
    }
}