import ICellAtomicData from "../interfaces/icell-atomic-data.interface";
import ICellData from "../interfaces/icell-data.interface";
import { FormulaOP } from "./formula-op-enum";

export default class FormulaData implements ICellData{
    private formula : Array<FormulaOP | ICellAtomicData>;

    public evaluate(): string {
        throw new Error("Method not implemented.");
    }
    public getRawValue(): string {
        throw new Error("Method not implemented.");
    }
}