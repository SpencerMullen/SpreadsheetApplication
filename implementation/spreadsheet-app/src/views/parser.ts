import ICell from "../interfaces/icell-interface";
import AverageRangeExpression from "../models/average-range-expression.model";
import FormulaData from "../models/formula-data.model";
import { FormulaOP } from "../models/formula-op-enum";
import NumericData from "../models/numeric-data.model";
import ReferenceData from "../models/reference-data-model";
import StringData from "../models/string-data-model";
import SumRangeExpression from "../models/sum-range-expression.model";

// is the character a letter
export const isLetter = (char: string) => {
    return /^[A-Z]$/.test(char);
}
// represents a Parser class which takes a string and gets CellData
export class Parser {
    public constructor (private cells: Array<Array<ICell>>){}

    //  is the character a Formula operation
    private isFormulaOP = (char: string) => {
        switch (char) {
            case FormulaOP.PLUS:
                return true;
            case FormulaOP.MINUS:
                return true;
            case FormulaOP.MULT:
                return true;
            case FormulaOP.DIV:
                return true;
            default:
                return false;
        }
    }
    
    // parses a string into FormulaData if possible
    private parseFormula = (value: string) => {
        const data = new Array();
        const formulaData = new Array();
    
        let curData = "";
        for (let i = 0; i < value.length; i++) {
            // no two operators in a row
            if (this.isFormulaOP(value[i]) && curData === "") {
                return new StringData(value);
            }
            // once we see a formula op, push previous token to list and the op
            else if (this.isFormulaOP(value[i])) {
                data.push(curData);
                data.push(value[i]);
                curData = "";
            }
            // add character to current token
            else {
                curData += value[i];
            }
        }
        // if it ends with an operator it's invalid
        if (curData == "") {
            return new StringData(value);
        }
        data.push(curData);
        // parse each token
        for (let d of data) {
            if (this.isFormulaOP(d)) {
                formulaData.push(d);
            }
            else {
                formulaData.push(this.getDataType(d));
            }
        }
    
        return new FormulaData(formulaData);
    }
    // gets the corresponding CellData from a string
    public getDataType = (v: string) => {
        // Strip all white space
        const value = v.replace(/\s/g, "");
        if (value.startsWith("=")) {
            return this.parseFormula(value.substring(1)); 
        } else if (!isNaN(Number(value)) && value !== '') {
            return new NumericData(Number(value));
        } else if (this.isReference(value)) {
            const refCell = this.getReferenceCell(value);
            return new ReferenceData(refCell);
        } else if (this.isRangeExpression(value)) {
            return this.getRangeData(value);
        }
        else {
            return new StringData(v);
        }
    }
    
    /**
     * Find the corresponding row and column
     * @param innerValue a row column string like A6.
     * @returns [row position, col position]
     */
    private findRowColPos = (innerValue : string) : Array<number> => {
        let rowFound = false;
        let colFound = false;
        let rowNum = 0;
        let column = ""
        for (let c = 0; c < innerValue.length; c++) {
            // if we find a string during the row number it's invalid
            if (rowFound && isNaN(Number(innerValue[c]))) {
                return [-1, -1];
            }
            else if (isLetter(innerValue[c])) {
                colFound = true;
                column += innerValue[c];
            }
            // if we find a number without a column it's invalid
            else if (!isNaN(Number(innerValue[c])) && !colFound) {
                return [-1, -1];
            }
            else if (!isNaN(Number(innerValue[c]))) {
                rowNum = rowNum * 10 + Number(innerValue[c]);
                rowFound = true;
            }
            // any other characters are invalid 
            else {
                return [-1, -1];
            }
        }
        // row is out of bounds
        if (rowNum - 1 >= this.cells.length) {
            return [-1, -1];
        }
    
        let colNum = 0;
        // translates the alphabetic column position to a number. (A->1, AA->27...)
        for (let i = 0; i < column.length; i++) {
            const char = column.charCodeAt(i) - 'A'.charCodeAt(0) + 1;
            colNum = colNum * 26 + char;
        }
        colNum -= 1;
    
        if (colNum > this.cells[0].length) {
            return [-1,-1];
        }
        return [rowNum-1, colNum];
    }
    // is the value a valid REF data.
    private isReference = (value: string) : boolean => {
        const pattern = /^REF\((.*?)\)$/;
        if (!pattern.test(value)) {
            return false;
        }
    
        const positions = this.findRowColPos(value.substring(4, value.length - 1));
    
        if(positions[0] == -1 || positions[1] == -1) {
            return false;
        }
        return true;
    }
    
    // finds the actual cell that's being referenced
    private getReferenceCell = (value: string) : ICell => {
        const positions = this.findRowColPos(value.substring(4, value.length - 1));
        const row = positions[0];
        const col = positions[1];
        return this.cells[row][col];
    }
    
    // is the expression a valid Range Expression
    private isRangeExpression = (value: string) : boolean => {
        const sumPattern = /^SUM\((.*?)\)$/;
        const avgPattern = /^AVERAGE\((.*?)\)$/;
    
        if (!sumPattern.test(value) && !avgPattern.test(value)) {
            return false;
        }
    
        let innerValue = "";
        if (sumPattern.test(value)) {
            innerValue = value.substring(4, value.length - 1);
        }
        else {
            innerValue = value.substring(8, value.length - 1);
        }
        const range = innerValue.split("..");
        if (range.length != 2) {
            return false;
        }
        const startPos = this.findRowColPos(range[0]);
        const endPos = this.findRowColPos(range[1]);
        
        if (startPos[0] == -1 || startPos[1] == -1 || endPos[0] == -1 || endPos[1] == -1) {
            return false;
        }
    
        // The range must be in the same row or same column
        if (startPos[0] != endPos[0] && startPos[1] != endPos[1]) {
            return false;
        }
        
        // Start of the range must come before end of the other range
        if (startPos[0] === endPos[0] && startPos[1] > endPos[1]) {
            return false;
        }
        if (startPos[1] === endPos[1] && startPos[0] > endPos[0]) {
            return false;
        }
    
        return true;
    }
    
    // gets the corresponding Range Expression
    private getRangeData = (value: string) => {
        const sumPattern = /^SUM\((.*?)\)$/;
        
        let innerValue = "";
        if (sumPattern.test(value)) {
            innerValue = value.substring(4, value.length - 1);
        }
        else {
            innerValue = value.substring(8, value.length - 1);
        }
        const range = innerValue.split("..");
        const startPos = this.findRowColPos(range[0]);
        const endPos = this.findRowColPos(range[1]);
        const rangeCells = [];
        if (startPos[0] === endPos[0]) {
            for (let i = startPos[1]; i <= endPos[1]; i++) {
                rangeCells.push(this.cells[startPos[0]][i]);
            }
        }
        else {
            for (let i = startPos[0]; i <= endPos[0]; i++) {
                rangeCells.push(this.cells[i][startPos[1]]);
            }
        }
    
        if (sumPattern.test(value)) {
            return new SumRangeExpression(rangeCells);
        }
        else {
            return new AverageRangeExpression(rangeCells);
        }
    }
}

