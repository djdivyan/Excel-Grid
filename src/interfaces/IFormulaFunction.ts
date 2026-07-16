export interface IFormulaFunction {
    execute(values: number[]): number | string;
}