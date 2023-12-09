import AbstractRangeExpression from "./abstract-range-expression.model";
import ICell from "../interfaces/icell-interface";
import { GridPosition } from "../interfaces/types";
import CircularReferenceError from "../errors/circular-reference-error";
import InvalidOperandError from "../errors/invalid-operand-error";

export default class AverageRangeExpression extends AbstractRangeExpression {
    public constructor(range: ICell[]) {
        super(range);
    }

    // Use abstract method
    public createsCycle(seen: Set<GridPosition>): boolean {
        return super.createsCycle(seen);
    }

    // Evaluate the range (average)
    public evaluate(): string {
        if (this.range.length === 0) {
            return "0";
        }
        // Loop through the range and sum up the values, for data that does not evaluate to numbers, treat as 0
        let sum = 0;
        for (let i = 0; i < this.range.length; i++) {
            if (this.range[i].isDeleted()) {
                throw new CircularReferenceError();
            }
            const cellValue = this.range[i].evaluate();
            if (cellValue == "#REF!") {
                throw new CircularReferenceError();
            }
            const numericValue = Number(cellValue);
            if (isNaN(numericValue)) {
                throw new InvalidOperandError();
            } else {
                sum += numericValue;
            }
        }
        // Get the average
        const average = sum / this.range.length;
        return String(average);
    }

    // Get the raw value of the range denoted by "=AVERAGE({First Cell}:{Last Cell})"
    public getRawValue(): string {
        for (let cell of this.range) {
            if (cell.isDeleted()) {
                return "AVERAGE(#REF!)";
            } 
        }
        const position1 = this.range[0].getGridPosition().column + String(this.range[0].getGridPosition().row);
        const position2 = this.range[this.range.length - 1].getGridPosition().column + String(this.range[this.range.length - 1].getGridPosition().row);
        return "AVERAGE(" + position1 + ".." + position2 + ")";
    }
}