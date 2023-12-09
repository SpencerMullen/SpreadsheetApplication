import CircularReferenceError from "../errors/circular-reference-error";
import ICellData from "../interfaces/icell-data.interface";
import ICell from "../interfaces/icell-interface";
import { GridPosition } from "../interfaces/types";
import FormulaData from "./formula-data.model";
import ReferenceData from "./reference-data-model";
import StringData from "./string-data-model";
import AverageRangeExpression from "./average-range-expression.model";
import SumRangeExpression from "./sum-range-expression.model";

export default class Cell implements ICell {
    private data: ICellData = new StringData("");
    private deleted = false;

    public constructor(private position : GridPosition, data ?: ICellData){
        if (data) {
            this.data = data;
        }
    }

    // does this cell create a cycle?
    public createsCycle(seen: Set<GridPosition>): boolean {
        seen.add(this.position);
        return this.data.createsCycle(seen);
    }
    
    // adds CellData to a Cell
    public addData(data: ICellData): void {
        // If we're adding references or formulas we want to make sure it doesn't create a cycle.
        if (data instanceof ReferenceData || data instanceof FormulaData || data instanceof AverageRangeExpression || data instanceof SumRangeExpression) {
            const seen = new Set<GridPosition>([this.position]);
            if (data.createsCycle(seen)) {
                this.data = new StringData(data.getRawValue());
                throw new CircularReferenceError();    
            }
        }
        this.data = data;
    }
    // clears a cell back to its default value
    public clearCell(): void {
        this.data = new StringData("");
    }

    // Evaluates the data from a cell into a single string
    public evaluate(): string {
        return this.data.evaluate();
    }

    // Gets the value of cell with no evaluation
    public getRawValue(): string {
        return this.data.getRawValue();
    }
    
    // gets the position of the cell in the grid
    public getGridPosition(): GridPosition {
        return this.position;
    }
    
    // updates the position of the cell in the grid
    public updatePosition(position: GridPosition): void {
        this.position = position;
    }

    // labels a cell as deleted 
    public deleteCell(): void {
        this.deleted = true;
    }
    // is the current cell deleted?
    public isDeleted(): boolean {
        return this.deleted;
    }
}