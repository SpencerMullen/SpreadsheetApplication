import ICell from "../interfaces/icell-interface";
import IPredicate from "../interfaces/ipredicate.interface";

// is CellValue == ""?
export class Empty implements IPredicate {
    public constructor (private styles: React.CSSProperties) {}
    
    public match(cell: ICell): boolean {
        try {
            return cell.evaluate() == "";
        }
        catch (e) {
            return false;
        }
    }

    public getStyles(cell: ICell): React.CSSProperties {
        if (this.match(cell)) {
            return this.styles;
        }
        return {}
    }
    public toString(): string {
        let result = "Condition: Cell isEmpty, Styles: ";
        
        for (const key of Object.keys(this.styles)) {
            if (key == "fontWeight") {
                result += "bold ";
            }
            else if (key == "textStyle") {
                result += "italic ";
            }
            else if (key == "textDecoration") {
                result += "line-through ";
            }
            else if (key == "color") {
                result += " textColor";
            }
            else {
                result += " bgColor";
            }
        }
        return result; 
    }
}