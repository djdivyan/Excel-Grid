export class ColumnManager {
    private defaultWidth: number = 100;
    private customWidths: Map<number, number>;
    public totalColumns: number;
    
    constructor(totalColumns: number = 500) {
        this.customWidths = new Map();
        this.totalColumns = totalColumns;
    }


    public getWidth(index: number): number{
        return this.customWidths.get(index) ?? this.defaultWidth;
    }

    public setWidth(index: number,width:number): void{
        this.customWidths.set(index,width);
    }


    public getTotalWidth(): number {
        return this.totalColumns * this.defaultWidth;
    }

}