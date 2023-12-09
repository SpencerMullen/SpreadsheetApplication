import CircularReferenceError from "../errors/circular-reference-error";
import ICellAtomicData from "../interfaces/icell-atomic-data.interface";
import ICell from "../interfaces/icell-interface";
import { GridPosition } from "../interfaces/types";

export default class ReferenceData implements ICellAtomicData {
    public constructor(private cell: ICell){}
    
    public createsCycle(seen: Set<GridPosition>): boolean {
        if (seen.has(this.cell.getGridPosition())) {
            return true;
        }
        return this.cell.createsCycle(seen);
    }

    public evaluate(): string {
        if (this.cell.isDeleted()) {
            throw new CircularReferenceError();
        } 
        return this.cell.evaluate();
    }
    
    public getRawValue(): string {
        if (this.cell.isDeleted()) {
            return "REF(#REF!)";
        }
        const position = this.cell.getGridPosition();
        return "REF("+position.column + position.row.toString()+")";
    }    
}