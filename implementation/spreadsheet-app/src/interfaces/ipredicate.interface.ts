import ICell from "./icell-interface";

export default interface IPredicate {
    // does the cell match the condition?
    match(cell : ICell): boolean;
    // get the styles of the cell if it matches the predicate
    getStyles(cell : ICell): React.CSSProperties;
    // gets a string of the predicate, and expected styles
    toString(): string;
}