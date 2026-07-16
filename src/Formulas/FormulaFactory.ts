import type { IFormulaFunction } from "../interfaces/IFormulaFunction.js";
import { CountFunction } from "./CountFunction.js";
import { MaxFunction } from "./MaxFunction.js";
import { MinFunction } from "./MinFunction.js";
import { SumFunction } from "./SumFunction.js";

export class FormulaFactory {
    private static registry: Map<string, IFormulaFunction> = new Map([
        ['SUM', new SumFunction()],
        ['COUNT', new CountFunction()],
        ['MAX', new MaxFunction()],
        ['MIN', new MinFunction()]
    ]);

    //Allows adding new formulas from outside this class
    public static register(name: string, func: IFormulaFunction): void {
        this.registry.set(name.toUpperCase(), func);
    }

    //returns the function
    public static getFunction(name: string): IFormulaFunction | null {
        return this.registry.get(name.toUpperCase()) || null;
    }
}