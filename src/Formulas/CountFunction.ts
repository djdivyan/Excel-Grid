import type { IFormulaFunction } from "../interfaces/IFormulaFunction.js";

export class CountFunction implements IFormulaFunction {
    execute(values: number[]): number {
        return values.length;
    }
}