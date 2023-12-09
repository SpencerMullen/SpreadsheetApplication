import ICellAtomicData from "../interfaces/icell-atomic-data.interface";
import { GridPosition } from "../interfaces/types";
import ICell from "../interfaces/icell-interface";

export default abstract class AbstractRangeExpression implements ICellAtomicData {
    // Range that we will be evaluating upon
    protected range: ICell[];
    public constructor(range: ICell[]) {
        this.range = range;
    }

    // Check if the range contains a cycle
    public createsCycle(seen: Set<GridPosition>): boolean {
        for (const cell of this.range) {
            if (seen.has(cell.getGridPosition()) || cell.createsCycle(seen)) {
                console.log("Circular cell: " + JSON.stringify(cell.getGridPosition()));
                return true;
            }
        }
        return false;
    }

    // Evaluate the range
    public evaluate(): string {
        return "";
    }

    // Get the raw value of the range
    public getRawValue(): string {
        return "";
    }
}