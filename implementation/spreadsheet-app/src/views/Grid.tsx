import CircularReferenceError from "../errors/circular-reference-error";
import InvalidOperandError from "../errors/invalid-operand-error";
import ICell from "../interfaces/icell-interface";
import IPredicate from "../interfaces/ipredicate.interface";
import Cell from "../models/cell.model"
import CellComponent from "./Cell"
import { FilterBar } from "./FilterBar";
import './styles.css'
import { SetStateAction, useState } from "react";

interface GridProps {
    cells: Array<Array<Cell>>;
    styleGrid: Array<Array<React.CSSProperties>>;
    setStyleGrid: React.Dispatch<React.SetStateAction<Array<Array<React.CSSProperties>>>>;
}

function GridComponent({ cells, styleGrid, setStyleGrid}: GridProps) {
    // the position of the selected cell
    const [selectedCell, setSelectedCell] = useState([0, 0]);

    // the current state of the cell (unselected, selected, input)
    const [selectState, setSelectState] = useState("unselected");
    // grid containing conditional formatting filters
    const [condFilters, setCondFilters] = useState<Array<IPredicate>>([]);
    
    // tries evaluating the value of a cell, and returns the result or a corresponding error value
    const evaluateCell = (cell : ICell ) : string => {
        try {
            const result = cell.evaluate();
            return result;
        } catch (error) {
            if (error instanceof CircularReferenceError) {
                return "#REF!";
            }
            if (error instanceof InvalidOperandError) {
                return "VALUE!";
            }
        }
        return ""
    }
    // is the position the current selected cell
    const isSelectedCell = (rowIndex: number, cellIndex: number) : boolean => {
        return rowIndex === selectedCell[0] && cellIndex === selectedCell[1];
    }

    // gets all the styles for a cell based off the styleGrid and conditional formatting
    const getStyles = (cell: ICell, rowIndex: number, cellIndex: number) => {
        let curFilters = styleGrid[rowIndex][cellIndex];
        for (const pred of condFilters) {
            curFilters = {...curFilters, ...pred.getStyles(cell)}
        }
        return curFilters;
    }

    // handles all key down events
    const handleKeyDown = (e) => {
        const key = e.key;
        // clear the cell on backspace
        if ((key == "Backspace" || key == "Delete") && selectState == "selected") {
            cells[selectedCell[0]][selectedCell[1]].clearCell();
            setSelectState("unselected");
        }
        // move selection in given directions
        else if (key == "ArrowDown" && selectState == "selected") {
            const curRow = selectedCell[0];
            if (curRow != cells.length - 1) {
                setSelectedCell([curRow + 1, selectedCell[1]]);
            }
        }
        else if (key == "ArrowUp" && selectState == "selected") {
            const curRow = selectedCell[0];
            if (curRow != 0) {
                setSelectedCell([curRow - 1, selectedCell[1]]);
            }
        }
        else if (key == "ArrowRight" && selectState == "selected") {
            const curCol = selectedCell[1];
            if (curCol != cells[0].length - 1) {
                setSelectedCell([selectedCell[0], curCol + 1]);
            }
        }

        else if (key == "ArrowLeft" && selectState == "selected") {
            const curCol = selectedCell[1];
            if (curCol != 0) {
                setSelectedCell([selectedCell[0], curCol - 1]);
            }
        }
    }
    return (
    <>
        <FilterBar styleGrid={styleGrid} setStyleGrid={setStyleGrid} curPos={selectedCell} condFilters={condFilters} setCondFilters={setCondFilters}/>
        <table className=" table table-bordered" tabIndex={10000} onKeyDown={handleKeyDown}>
            <thead>
                <tr>
                    <th scope="col"></th>
                    {cells[0].map((_, index) => (
                        <th key={index} scope="col">{cells[0][index].getGridPosition().column}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {cells.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        <th scope="row">{rowIndex + 1}</th>
                        {row.map((cell, cellIndex) => (
                            <td key={cellIndex} onClick={() => setSelectedCell([rowIndex, cellIndex])} >
                                {
                                    // one click selects the cell
                                    selectState === "selected" && isSelectedCell(rowIndex, cellIndex) ?
                                        <div className='cell selected' style={getStyles(cell, rowIndex, cellIndex)} onClick={() => setSelectState("input")}>
                                            {cell.getRawValue()}
                                        </div>
                                        : 
                                        
                                    // double-clicking a selected cell allows the user to change the cell data
                                    selectState === "input" && isSelectedCell(rowIndex, cellIndex) ?
                                        <CellComponent cell={cell} setSelectState={setSelectState} setSelectCell={setSelectedCell} pos={[rowIndex, cellIndex]} cells={cells}  />
                                        :

                                    // default state of unselected cell
                                    <div className='cell' style={getStyles(cell, rowIndex, cellIndex)} onClick={() => setSelectState("selected")}>
                                        {evaluateCell(cell)}
                                    </div>
                                }
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
        </>
    )
}
export default GridComponent;