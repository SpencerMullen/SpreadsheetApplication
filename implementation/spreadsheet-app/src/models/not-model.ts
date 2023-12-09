import ICell from "../interfaces/icell-interface";
import IPredicate from "../interfaces/ipredicate.interface";

// is NOT (condition)
export class Not implements IPredicate {
    public constructor (private pred: IPredicate, private styles: React.CSSProperties) {}
    
    public match(cell: ICell): boolean {
        return !(this.pred.match(cell));
    }

    public getStyles(cell: ICell): React.CSSProperties {
        if (this.match(cell)) {
            return this.styles;
        }
        return {}
    }
    public toString(): string {
        return "NOT " + this.pred.toString();
    }
}