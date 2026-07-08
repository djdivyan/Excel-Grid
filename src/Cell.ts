export class Cell {
    public value: string | number;
    public displayValue: string | number;
    constructor(value: string | number) {        
        this.value = value;
        this.displayValue = value;
    }
}