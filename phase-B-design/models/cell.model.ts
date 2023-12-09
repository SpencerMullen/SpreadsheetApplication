import ICellData from "../interfaces/icell-data.interface";
import ICell from "../interfaces/icell-interface";

export default class Cell implements ICell {
    addData(data: ICellData): void {
        throw new Error("Method not implemented.");
    }
    clearCell(): void {
        throw new Error("Method not implemented.");
    }
    evaluate(): string {
        throw new Error("Method not implemented.");
    }
    updateObservers(): void {
        throw new Error("Method not implemented.");
    }
    getRawValue(): string {
        throw new Error("Method not implemented.");
    }
}