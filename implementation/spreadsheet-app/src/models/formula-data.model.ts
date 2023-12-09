import InvalidOperandError from "../errors/invalid-operand-error";
import ICellAtomicData from "../interfaces/icell-atomic-data.interface";
import ICellData from "../interfaces/icell-data.interface";
import { GridPosition } from "../interfaces/types";
import AbstractRangeExpression from "./abstract-range-expression.model";
import { FormulaOP } from "./formula-op-enum";
import ReferenceData from "./reference-data-model";
import {evaluate} from "mathjs";

export default class FormulaData implements ICellData{
    public constructor(private formula : Array<FormulaOP | ICellAtomicData>){}

    // find cycles within reference data and range expressions
    public createsCycle(seen: Set<GridPosition>): boolean {
        for(const token of this.formula) {
            if (token instanceof ReferenceData || token instanceof AbstractRangeExpression) {
                const cycleFound = token.createsCycle(seen);
                if (cycleFound) {
                    return true;
                }
            }    
        }
        return false;
    }

    public evaluate(): string {
        let evaluationString = "";
        let evaluationStrings = new Array<string>();
        let stringExp = false;
    
        for (const token of this.formula) {
            // if not an operator, evaluate the data
            if (typeof token !== "string") {
                const evaluatedToken = token.evaluate();

                // If the token is a number and we're in a string expression, throw an error
                if (stringExp && !isNaN(Number(evaluatedToken))) {
                    throw new InvalidOperandError();
                }
                if (isNaN(Number(evaluatedToken))) {
                    stringExp = true;
                }
                evaluationString += evaluatedToken;
                evaluationStrings.push(evaluatedToken);
            }
            else {
                if (stringExp && token != FormulaOP.PLUS) {
                    // string expressions can only work with concatenation or +
                    throw new InvalidOperandError()
                }
                evaluationString += token;
            }
        }

        if (stringExp) {
            return this.evaluateStringExp(evaluationStrings);
        }
        return "" + evaluate(evaluationString);
    }
    public getRawValue(): string {
        let returnString = "=";
        for (const token of this.formula) {
            if (typeof token === "string") {
                returnString += token;
            }
            else {
                returnString += token.getRawValue();
            }
        }
        return returnString;
    }
    // concatentates a list of strings a+b = ab
    private evaluateStringExp(strs: Array<string>) : string {
        let ret = "";
        for (const str of strs) {
            if (!isNaN(Number(str))) {
                throw new InvalidOperandError();
            }
            ret += str;
        }

        return ret;
    }
}