import ICell from "./icell-interface";

export default interface IGrid {
    deleteColumn(index: number) : void;
    deleteRow(index: number) : void;
    getCellAt(row: number, col: number): ICell;
}