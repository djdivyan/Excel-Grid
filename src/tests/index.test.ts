import { DataStore } from "../DataStore.js";
import { FormulaParser } from "../FormulaParser.js";

describe("FormulaParser Tests", () => {
    let dataStore: DataStore;

    beforeEach(() => {
        dataStore = new DataStore();
    });

    describe("SUM Formula Engine", () => {
        test("should sum a range of positive integers and decimals", () => {
            // Col A is index 0. Rows 1,2,3 are indexes 0,1,2
            dataStore.setCell(0, 0, "10");
            dataStore.setCell(1, 0, "5.5");
            dataStore.setCell(2, 0, "4.5");
            
            const result = FormulaParser.evaluate("=SUM(A1:A3)", dataStore as any);
            expect(result).toBe(20);
        });

        test("should handle negative numbers and zero correctly", () => {
            dataStore.setCell(0, 1, "-10");
            dataStore.setCell(1, 1, "0");
            dataStore.setCell(2, 1, "25");

            const result = FormulaParser.evaluate("=SUM(B1:B3)", dataStore as any);
            expect(result).toBe(15);
        });

        test("should treat empty cells or text values as 0 during calculation", () => {
            dataStore.setCell(0, 2, "100");
            dataStore.setCell(1, 2, "");
            dataStore.setCell(2, 2, "NotANum");

            const result = FormulaParser.evaluate("=SUM(C1:C3)", dataStore as any);
            expect(result).toBe(100);
        });
    });

    describe("MIN Formula Engine", () => {
        test("should find the minimum in a range of positive integers and decimals", () => {
            dataStore.setCell(0, 0, "10");
            dataStore.setCell(1, 0, "5.5");
            dataStore.setCell(2, 0, "4.5");

            const result = FormulaParser.evaluate("=MIN(A1:A3)", dataStore as any);
            expect(result).toBe(4.5);
        });

        test("should handle negative numbers and zero correctly", () => {
            dataStore.setCell(0, 1, "-10");
            dataStore.setCell(1, 1, "0");
            dataStore.setCell(2, 1, "25");

            const result = FormulaParser.evaluate("=MIN(B1:B3)", dataStore as any);
            expect(result).toBe(-10);
        });

        test("should treat empty cells or text values as ignored during calculation", () => {
            dataStore.setCell(0, 5, "100");
            dataStore.setCell(1, 5, "");
            dataStore.setCell(2, 5, "NotANum");
            dataStore.setCell(3, 5, "5");

            const result = FormulaParser.evaluate("=MIN(F1:F4)", dataStore as any);
            expect(result).toBe(5);
        });
    });

    describe("MAX Formula Engine", () => {
        test("should find the maximum in a range of positive integers and decimals", () => {
            dataStore.setCell(0, 0, "10");
            dataStore.setCell(1, 0, "5.5");
            dataStore.setCell(2, 0, "4.5");

            const result = FormulaParser.evaluate("=MAX(A1:A3)", dataStore as any);
            expect(result).toBe(10);
        });

        test("should handle negative numbers and zero correctly", () => {
            dataStore.setCell(0, 1, "-10");
            dataStore.setCell(1, 1, "0");
            dataStore.setCell(2, 1, "25");

            const result = FormulaParser.evaluate("=MAX(B1:B3)", dataStore as any);
            expect(result).toBe(25);
        });

        test("should treat empty cells or text values as ignored during calculation", () => {
            dataStore.setCell(0, 2, "100");
            dataStore.setCell(1, 2, "");
            dataStore.setCell(2, 2, "NotANum");
            dataStore.setCell(3, 2, "5");

            const result = FormulaParser.evaluate("=MAX(C1:C4)", dataStore as any);
            expect(result).toBe(100);
        });
    });

    describe("COUNT Formula Engine", () => {
        test("should find the count of numeric values in a range", () => {
            dataStore.setCell(0, 0, "10");
            dataStore.setCell(1, 0, "5.5");
            dataStore.setCell(2, 0, "4.5");

            const result = FormulaParser.evaluate("=COUNT(A1:A3)", dataStore as any);
            expect(result).toBe(3);
        });

        test("should count negative numbers and zero correctly", () => {
            dataStore.setCell(0, 1, "-10");
            dataStore.setCell(1, 1, "0");
            dataStore.setCell(2, 1, "25");

            const result = FormulaParser.evaluate("=COUNT(B1:B3)", dataStore as any);
            expect(result).toBe(3);
        });

        test("should ignore empty cells or text values", () => {
            dataStore.setCell(0, 2, "100");
            dataStore.setCell(1, 2, "");
            dataStore.setCell(2, 2, "NotANum");
            dataStore.setCell(3, 2, "5");

            const result = FormulaParser.evaluate("=COUNT(C1:C4)", dataStore as any);
            expect(result).toBe(2);
        });
    });

    describe("Formula Arguments Engine", () => {
        test("should gracefully return a fallback string for unsupported functions", () => {
            const result = FormulaParser.evaluate("=FAKEFUNC(A1:A3)", dataStore as any);
            expect(result).toBe("#NotRecognised?");
        });

        test("should return the original string if it is not formatted as a function", () => {
            const result = FormulaParser.evaluate("Hello World", dataStore as any);
            expect(result).toBe("Hello World");
        });

        test("should process lowercase cell coordinates and formulas", () => {
            dataStore.setCell(0, 0, "5");
            dataStore.setCell(1, 0, "5");

            //tests lowercase formula and coordinates
            const result = FormulaParser.evaluate("=sum(a1:a2)", dataStore as any);
            expect(result).toBe(10);
        });
    });
});
