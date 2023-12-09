import ICellData from "./icell-data.interface";
import { GridPosition } from "./types";

export default interface ICell {
    addData(data: ICellData) : void;
    clearCell() : void;
    evaluate() : string
    getRawValue() : string;
    getGridPosition(): GridPosition;
    createsCycle(seen: Set<GridPosition>): boolean;
    updatePosition(position: GridPosition): void;
    deleteCell():void;
    isDeleted(): boolean;
}