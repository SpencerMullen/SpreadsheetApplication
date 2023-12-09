import ICell from "../interfaces/icell-interface";
import Cell from "./cell.model";
import { describe, beforeEach, it, expect } from "vitest";
import NumericData from "./numeric-data.model";
import StringData from "./string-data-model";
import ReferenceData from "./reference-data-model";
import CircularReferenceError from "../errors/circular-reference-error";
import FormulaData from "./formula-data.model";
import { FormulaOP } from "./formula-op-enum";
import ICellAtomicData from "../interfaces/icell-atomic-data.interface";
import AverageRangeExpression from "./average-range-expression.model";
import SumRangeExpression from "./sum-range-expression.model";
import InvalidOperandError from "../errors/invalid-operand-error";

describe("add basic data to cells", () => {
    let cell: ICell;
    beforeEach(() => {
        cell = new Cell({ column: "A", row: 8 });
    });

    it('default value of cell data should be empty string', () => {
        expect(cell.getRawValue()).toBe("");
    });
    it("cell raw value should be a 8 after passing in NumericData containing 8 is added", () => {
        cell.addData(new NumericData(8))
        expect(cell.getRawValue()).toBe("8");
    });
    it("cell raw value should be a 8 after NumericData containing 8 is added", () => {
        cell.addData(new NumericData(8));
        expect(cell.getRawValue()).toBe("8");
    });
    it("cell raw value should be 'hello' after StringDate containing 'hello' is added", () => {
        cell.addData(new StringData("hello"));
        expect(cell.getRawValue()).toBe("hello");
    });
    it("should be '' after adding numeric value and then clearing", () => {
        cell.addData(new NumericData(8));
        expect(cell.getRawValue()).toBe("8");
        cell.clearCell()
        expect(cell.getRawValue()).toBe("");
    })
    it("should be '' after adding string value and then clearing", () => {
        cell.addData(new StringData('a'));
        expect(cell.getRawValue()).toBe("a");
        cell.clearCell()
        expect(cell.getRawValue()).toBe("");
    });
    it('reference cell should evaluate to other cells value', () => {
        cell.addData(new StringData("original cell"));
        const refCell = new Cell({ row: 1, column: "B" });
        refCell.addData(new ReferenceData(cell));
        expect(refCell.getRawValue()).toBe("REF(A8)");
        expect(refCell.evaluate()).toBe("original cell");
    });
});

describe("test different reference scenarios", () => {
    let cell: ICell;

    beforeEach(() => {
        cell = new Cell({ column: "A", row: 8 });
    });

    it("should test chains of references with no cycles", () => {
        cell.addData(new NumericData(1010));
        const ref1 = new Cell({ column: "A", row: 9 });
        const ref2 = new Cell({ column: "B", row: 9 });
        const ref3 = new Cell({ column: "C", row: 9 });
        ref1.addData(new ReferenceData(cell));
        ref2.addData(new ReferenceData(ref1));
        ref3.addData(new ReferenceData(ref2));

        expect(ref1.evaluate()).toBe("1010");
        expect(ref2.evaluate()).toBe("1010");
        expect(ref3.evaluate()).toBe("1010");

        expect(ref1.getRawValue()).toBe("REF(A8)");
        expect(ref2.getRawValue()).toBe("REF(A9)");
        expect(ref3.getRawValue()).toBe("REF(B9)");
    })

    it("should throw an error if a cell refers to itself", () => {
        expect(() => { cell.addData(new ReferenceData(cell)) }).toThrow(CircularReferenceError);
    });
    it("should throw an error if there's a cycle between two cells", () => {
        const ref1 = new Cell({ row: 8, column: "B" });
        ref1.addData(new ReferenceData(cell));
        expect(() => { cell.addData(new ReferenceData(ref1)) }).toThrow(CircularReferenceError);
    });
    it("should throw an error with a cycle with formulas", () => {
        // Formula (A8) = RefA1 + 1, A1 = Ref A2, A2 = Ref A3, A3 = Ref A8
        const ref2 = new Cell({ row: 2, column: "A" });
        const ref3 = new Cell({ row: 3, column: "A" });
        const exp = new Array<FormulaOP | ICellAtomicData>();

        exp.push(new ReferenceData(ref2));
        exp.push(FormulaOP.PLUS);
        exp.push(new NumericData(1));

        cell.addData(new FormulaData(exp));
        ref2.addData(new ReferenceData(ref3));
        expect(() => { ref3.addData(new ReferenceData(cell)) }).toThrow(CircularReferenceError);
    });
    it("should reflect new data if referred cell data changes", () => {
        const ref1 = new Cell({ row: 1, column: "A" });
        cell.addData(new NumericData(10));
        ref1.addData(cell);
        expect(ref1.evaluate()).toBe("10");
        cell.addData(new NumericData(20));
        expect(ref1.evaluate()).toBe("20");
    });
})

describe("test range expressions", () => {
    let cell1: ICell, cell2: ICell, cell3: ICell, cell4: ICell, cell5: ICell, cell6: ICell;
    beforeEach(() => {
        cell1 = new Cell({ row: 1, column: "A" });
        cell2 = new Cell({ row: 2, column: "A" });
        cell3 = new Cell({ row: 3, column: "A" });
        cell4 = new Cell({ row: 4, column: "A" });
        cell5 = new Cell({ row: 5, column: "A" });
        cell6 = new Cell({ row: 6, column: "A" });
    });

    it("should evaluate ranges of length 0 to 0", () => {
        const range: ICell[] = [];
        const avg = new AverageRangeExpression(range);
        expect(avg.evaluate()).toBe("0");
        const sum = new SumRangeExpression(range);
        expect(sum.evaluate()).toBe("0");
    });

    it("should evaluate average range expressions", () => {
        cell1.addData(new NumericData(1));
        cell2.addData(new NumericData(2));
        cell3.addData(new NumericData(3));
        cell4.addData(new NumericData(4));
        cell5.addData(new NumericData(5));
        cell6.addData(new NumericData(6));
        const range = [cell1, cell2, cell3, cell4, cell5, cell6];
        const avg = new AverageRangeExpression(range);
        expect(avg.evaluate()).toBe("3.5");
    });

    it("should evaluate sum range expressions", () => {
        cell1.addData(new NumericData(1));
        cell2.addData(new NumericData(2));
        cell3.addData(new NumericData(3));
        cell4.addData(new NumericData(4));
        cell5.addData(new NumericData(5));
        cell6.addData(new NumericData(6));
        const range = [cell1, cell2, cell3, cell4, cell5, cell6];
        const sum = new SumRangeExpression(range);
        expect(sum.evaluate()).toBe("21");
    });

    it("should evaluate average ranges of reference data to a numeric cell", () => {
        cell1.addData(new NumericData(1));
        cell2.addData(new NumericData(2));
        cell3.addData(new NumericData(3));
        cell4.addData(new NumericData(4));
        cell5.addData(new NumericData(5));
        cell6.addData(new ReferenceData(cell3));
        const range = [cell1, cell2, cell3, cell4, cell5, cell6];
        const avg = new AverageRangeExpression(range);
        expect(avg.evaluate()).toBe("3");
    });

    it("should evaluate sum ranges of reference data to a numeric cell", () => {
        cell1.addData(new NumericData(1));
        cell2.addData(new NumericData(2));
        cell3.addData(new NumericData(3));
        cell4.addData(new NumericData(4));
        cell5.addData(new NumericData(5));
        cell6.addData(new ReferenceData(cell5));
        const range = [cell1, cell2, cell3, cell4, cell5, cell6];
        const sum = new SumRangeExpression(range);
        expect(sum.evaluate()).toBe("20");
    });

    it("should throw invalid operand error on average of non-numeric data", () => {
        cell1.addData(new NumericData(1));
        cell2.addData(new NumericData(1));
        cell3.addData(new NumericData(6));
        cell4.addData(new NumericData(4));
        cell5.addData(new StringData("hello"));
        cell6.addData(new ReferenceData(cell5));
        const range = [cell1, cell2, cell3, cell4, cell5, cell6];
        const avg = new AverageRangeExpression(range);
        expect(()=>{avg.evaluate()}).toThrow(InvalidOperandError);
    });

    it("should throw invalid operand error on sum of non-numeric data", () => {
        cell1.addData(new NumericData(1));
        cell2.addData(new NumericData(1));
        cell3.addData(new NumericData(6));
        cell4.addData(new NumericData(4));
        cell5.addData(new StringData("hello"));
        cell6.addData(new ReferenceData(cell5));
        const range = [cell1, cell2, cell3, cell4, cell5, cell6];
        const sum = new SumRangeExpression(range);
        expect(()=>{sum.evaluate()}).toThrow(InvalidOperandError);
    });

    /*it("should evaluate average ranges of formula data", ()=> {
        cell1.addData(new NumericData(1));
        cell2.addData(new NumericData(2));
        cell3.addData(new NumericData(3));
        cell4.addData(new NumericData(4));
        cell5.addData(new FormulaData([new NumericData(5), FormulaOP.PLUS, new NumericData(3)]));
        cell6.addData(new NumericData(6));
        const range = [cell1, cell2, cell3, cell4, cell5, cell6];
        const avg = new AverageRangeExpression(range);
        expect(avg.evaluate()).toBe("4");
    });

    it("should evaluate sum ranges of formula data", ()=> {
        cell1.addData(new NumericData(1));
        cell2.addData(new NumericData(2));
        cell3.addData(new NumericData(3));
        cell4.addData(new NumericData(4));
        cell5.addData(new FormulaData([new NumericData(5), FormulaOP.PLUS, new NumericData(3)]));
        cell6.addData(new NumericData(6));
        const range = [cell1, cell2, cell3, cell4, cell5, cell6];
        const sum = new SumRangeExpression(range);
        expect(sum.evaluate()).toBe("24");
    });*/

    it("should throw an error if the average range contains a cycle", () => {
        cell1.addData(new NumericData(1));
        cell2.addData(new NumericData(2));
        cell3.addData(new NumericData(3));
        cell4.addData(new NumericData(4));
        cell5.addData(new NumericData(5));
        expect(() => { cell6.addData(new AverageRangeExpression([cell1, cell2, cell3, cell4, cell5, cell6])) }).toThrow(CircularReferenceError);
    });

    it("should throw an error if the sum range contains a cycle", () => {
        cell1.addData(new NumericData(1));
        cell2.addData(new NumericData(2));
        cell3.addData(new NumericData(3));
        cell4.addData(new NumericData(4));
        cell5.addData(new NumericData(5));
        expect(() => { cell6.addData(new AverageRangeExpression([cell1, cell2, cell3, cell4, cell5, cell6])) }).toThrow(CircularReferenceError);
    });

    it("should throw an error if the range contains a range that references the original expression", () => {
        /*
        1          | 1
        2          | 2
        AVG(B1:B3) | SUM(A1:A3)
        */
        cell1.addData(new NumericData(1));
        cell2.addData(new NumericData(2));
        cell4.addData(new NumericData(1));
        cell5.addData(new NumericData(2));
        cell3.addData(new AverageRangeExpression([cell4, cell5, cell6]));
        expect(() => { cell6.addData(new SumRangeExpression([cell1, cell2, cell3])) }).toThrow(CircularReferenceError);
    });


    it("should get the correct raw values given a range", () => {
        cell1.addData(new NumericData(1));
        cell2.addData(new NumericData(2));
        cell3.addData(new NumericData(3));
        cell4.addData(new NumericData(4));
        cell5.addData(new NumericData(5));
        cell6.addData(new NumericData(6));
        const range = [cell1, cell2, cell3, cell4, cell5, cell6];
        const avg = new AverageRangeExpression(range);
        const sum = new SumRangeExpression(range);
        expect(avg.getRawValue()).toBe("AVERAGE(A1..A6)");
        expect(sum.getRawValue()).toBe("SUM(A1..A6)");
    });
});

describe("test adding functions to cells", () => {
    let cell: ICell;
    beforeEach(()=> {
        cell = new Cell({row: 1, column: "A"});
    })
    it("should work with basic addition", () => {
        const formData = new Array();
        formData.push(new NumericData(8));
        formData.push("+");
        formData.push(new NumericData(10));

        cell.addData(new FormulaData(formData));
        expect(cell.getRawValue()).toBe("=8+10");
        expect(cell.evaluate()).toBe("18");
    });
    it("should work with basic subtraction", () => {
        const formData = new Array();
        formData.push(new NumericData(8));
        formData.push("-");
        formData.push(new NumericData(10));

        cell.addData(new FormulaData(formData));
        expect(cell.getRawValue()).toBe("=8-10");
        expect(cell.evaluate()).toBe("-2");
    });
    it("should work with basic multiplication", () => {
        const formData = new Array();
        formData.push(new NumericData(8));
        formData.push("*");
        formData.push(new NumericData(10));

        cell.addData(new FormulaData(formData));
        expect(cell.getRawValue()).toBe("=8*10");
        expect(cell.evaluate()).toBe("80");
    });
    it("should work with basic division", () => {
        const formData = new Array();
        formData.push(new NumericData(20));
        formData.push("/");
        formData.push(new NumericData(10));

        cell.addData(new FormulaData(formData));
        expect(cell.getRawValue()).toBe("=20/10");
        expect(cell.evaluate()).toBe("2");
    });
    it("should work with addition of strings", () => {
        const formData = new Array();
        formData.push(new StringData("a"));
        formData.push("+");
        formData.push(new StringData("b"));
        formData.push("+");
        formData.push(new StringData("c"));

        cell.addData(new FormulaData(formData));
        expect(cell.getRawValue()).toBe("=a+b+c");
        expect(cell.evaluate()).toBe("abc");
    });
    it("should work with correct order of operations", () => {
        const formData = new Array();
        formData.push(new NumericData(8));
        formData.push("+");
        formData.push(new NumericData(2));
        formData.push("*");
        formData.push(new NumericData(10));


        cell.addData(new FormulaData(formData));
        expect(cell.getRawValue()).toBe("=8+2*10");
        expect(cell.evaluate()).toBe("28");
    });
    it("should error on subtraction using strings", () => {
        const formData = new Array();
        formData.push(new StringData("a"));
        formData.push("-");
        formData.push(new StringData("b"));

        cell.addData(new FormulaData(formData));
        expect(cell.getRawValue()).toBe("=a-b");
        expect(()=>{cell.evaluate()}).toThrow(InvalidOperandError);
    });
    it("should error on multiplication using strings", () => {
        const formData = new Array();
        formData.push(new StringData("a"));
        formData.push("*");
        formData.push(new StringData("b"));

        cell.addData(new FormulaData(formData));
        expect(cell.getRawValue()).toBe("=a*b");
        expect(()=>{cell.evaluate()}).toThrow(InvalidOperandError);
    });
    it("should error on division using strings", () => {
        const formData = new Array();
        formData.push(new StringData("a"));
        formData.push("/");
        formData.push(new StringData("b"));

        cell.addData(new FormulaData(formData));
        expect(cell.getRawValue()).toBe("=a/b");
        expect(()=>{cell.evaluate()}).toThrow(InvalidOperandError);
    });
    it("should error on expressions with different operand types", () => {
        const formData = new Array();
        formData.push(new NumericData(8));
        formData.push("+");
        formData.push(new StringData("b"));

        cell.addData(new FormulaData(formData));
        expect(cell.getRawValue()).toBe("=8+b");
        expect(()=>{cell.evaluate()}).toThrow(InvalidOperandError);
    });
    it("should evaluate an expression with multiple references", () => {
        // = 8 + SUM(C1..C3) * REF(A6)
        let c1 = new Cell({row: 1, column:"C"});
        let c2 = new Cell({row: 2, column:"C"});
        let c3 = new Cell({row: 3, column:"C"});

        c1.addData(new NumericData(5));
        c2.addData(new NumericData(6));
        c3.addData(new NumericData(7));

        let c4 = new Cell({row: 6, column:"A"});
        c4.addData(new NumericData(2));
        
        const formData = new Array();
        formData.push(new NumericData(8));
        formData.push("+");
        formData.push(new SumRangeExpression([c1, c2, c3]));
        formData.push("*");
        formData.push(new ReferenceData(c4));
        
        cell.addData(new FormulaData(formData));
        expect(cell.evaluate()).toBe("44");
    })

})