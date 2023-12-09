import { GridPosition } from "./types";

export default interface ICellData {
    evaluate(): string;
    getRawValue(): string;
    createsCycle(seen : Set<GridPosition>): boolean;
}