import ICellAtomicData from "../interfaces/icell-atomic-data.interface";

class NumericData implements ICellAtomicData {
    private value: number;
    evaluate(): string {
        throw new Error("Method not implemented.");
    }
    getRawValue(): string {
        throw new Error("Method not implemented.");
    }
}