import type { IFormulaFunction } from "../interfaces/IFormulaFunction.js";

export class MaxFunction implements IFormulaFunction {
    execute(values: number[]): number {
        return values.length ? Math.max(...values) : 0;
    }
}
