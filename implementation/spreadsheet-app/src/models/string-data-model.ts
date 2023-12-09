import ICellAtomicData from "../interfaces/icell-atomic-data.interface";
import { GridPosition } from "../interfaces/types";

// represents a String
export default class StringData implements ICellAtomicData {
    public constructor(private value: string){}
    
    public createsCycle(seen: Set<GridPosition>): boolean {
        return false;
    }
    
    public evaluate(): string {
        return this.value;
    }
    public getRawValue(): string {
        return this.value;
    }
}