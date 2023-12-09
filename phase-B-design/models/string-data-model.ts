import ICellAtomicData from "../interfaces/icell-atomic-data.interface";

export default class StringData implements ICellAtomicData {
    private value: string;
    
    public evaluate(): string {
        throw new Error("Method not implemented.");
    }
    public getRawValue(): string {
        throw new Error("Method not implemented.");
    }
}