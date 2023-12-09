import ICellData from "./icell-data.interface";

export default interface ICell {
    addData(data: ICellData) : void;
    clearCell() : void;
    evaluate() : string;
    updateObservers() : void;
    getRawValue() : string;
}