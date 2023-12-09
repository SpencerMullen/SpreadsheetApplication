import Cell from "../models/cell.model";
import React, { useState } from "react";
import ICell from "../interfaces/icell-interface";
import { Parser } from "./parser";
import StringData from "../models/string-data-model";

interface CellProps {
    cell: Cell;
    setSelectState: React.Dispatch<React.SetStateAction<string>>;
    setSelectCell: React.Dispatch<React.SetStateAction<Array<number>>>;
    pos: Array<number>;
    cells: Array<Array<ICell>>;
}

function CellComponent({cell, setSelectState, setSelectCell, pos, cells}: CellProps) {
    const [rawValue, setRawValue] = useState(cell.getRawValue());

    const setDataType = (e : React.FocusEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setRawValue(value);
        const parser = new Parser(cells);
        return parser.getDataType(value);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setRawValue(value);
    }
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const key = e.key;
        if (key === "Enter") {
            const targetEvent = e.target as HTMLInputElement;
            targetEvent.blur();
            
            if (pos[0] < cells.length - 1) {
                const newPos = [pos[0]+1, pos[1]];
                setSelectCell(newPos);
            }
            setSelectState("selected");
        }
    }

    return (
        <>
            <input
                type="text"
                value={rawValue}
                onChange={(e)=> {
                    handleChange(e);
                }}
                onBlur={(e) => {
                    const dataType = setDataType(e);
                    try {
                        cell.addData(dataType);
                    }
                    catch (e) {
                        cell.addData(new StringData("#REF!"))
                    }
                    
                }}
                onKeyDown={(e) => {
                    handleKeyDown(e);
                }}
            />
        </>
    );
}
export default CellComponent