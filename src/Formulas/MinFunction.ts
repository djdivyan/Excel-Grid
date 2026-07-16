import type { IFormulaFunction } from "../interfaces/IFormulaFunction.js";

export class MinFunction implements IFormulaFunction {
    execute(values: number[]): number {
        return values.length ? Math.min(...values) : 0;
    }
}