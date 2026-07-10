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
    
    public async loadJsonData(url: string): Promise<void>{
        try {
            const response = await fetch(url);
            const data: IEmployee[] = await response.json();
            //Row 0 for headers
            const headers = ["ID", "First Name", "Last Name", "Age", "Salary"];

            headers.forEach((header: string, col: number) => {
                this.setCell(0, col, header);
            });

            data.forEach((record: IEmployee, index: number) => {
                const row = index + 1; //Start at Row 1
                this.setCell(row, 0, record.id);
                this.setCell(row, 1, record.firstName);
                this.setCell(row, 2, record.lastName);
                this.setCell(row, 3, record.age);
                this.setCell(row, 4, record.salary);
            });

            console.log(`Loaded ${data.length} records into the DataStore!`);
        } catch (error) {
            console.error("Failed to load data: ", error);
        }
    }
}