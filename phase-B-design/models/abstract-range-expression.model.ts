import ICellAtomicData from "../interfaces/icell-atomic-data.interface";
import ICellData from "../interfaces/icell-data.interface";

export default abstract class AbstractRangeExpression implements ICellAtomicData {
    private range: ICellData[];

    public evaluate(): string {
        throw new Error("Method not implemented.");
    }
    public getRawValue(): string {
        throw new Error("Method not implemented.");
    }
}