export class RowManager {
    private defaultHeight: number = 30;
    private customHeights: Map<number, number>;
    public totalRows: number;
    
    constructor(totalRows: number = 100000) {
        this.customHeights = new Map();
        this.totalRows = totalRows;
    }

    public getHeight(index: number): number{
        return this.customHeights.get(index) ?? this.defaultHeight;
    }

    public setHeight(index: number,height:number): void{
        this.customHeights.set(index,height);
    }

    public getTotalHeight(): number {
        return this.totalRows * this.defaultHeight; 
    }
}