import ICellAtomicData from "../interfaces/icell-atomic-data.interface";
import ICell from "../interfaces/icell-interface";

export default class ReferenceData implements ICellAtomicData {
    private cell: ICell;
    public evaluate(): string {
        throw new Error("Method not implemented.");
    }
    public getRawValue(): string {
        throw new Error("Method not implemented.");
    }
}