import IGrid from "../interfaces/igrid.interface";
import ICell from "../interfaces/icell-interface";

export default class Grid implements IGrid{
    private grid : Array<Array<ICell>>;

    deleteColumn(index: number): void {
        throw new Error("Method not implemented.");
    }
    deleteRow(index: number): void {
        throw new Error("Method not implemented.");
    }
    public getCellAt(row: number, col: number): ICell {
        throw new Error("Method not implemented.");
    }
}