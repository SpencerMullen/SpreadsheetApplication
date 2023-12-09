import ICellAtomicData from "../interfaces/icell-atomic-data.interface";
import { GridPosition } from "../interfaces/types";

// represents a Number
export default class NumericData implements ICellAtomicData {
    
    public constructor(private value: number){}
    public createsCycle(seen: Set<GridPosition>): boolean {
        return false;
    }
    public evaluate(): string {
        return "" + this.value;
    }
    public getRawValue(): string {
        return "" + this.value;
    }
}