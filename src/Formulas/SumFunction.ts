import type { IFormulaFunction } from "../interfaces/IFormulaFunction.js";

export class SumFunction implements IFormulaFunction {
    execute(values: number[]): number {
        return values.reduce((a, b) => a + b, 0);
    }
}