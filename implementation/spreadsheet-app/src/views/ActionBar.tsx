import { Alert, Button, Form, Modal } from "react-bootstrap";
import ICell from "../interfaces/icell-interface";
import Cell from "../models/cell.model";
import { useState } from "react";
import { Parser, isLetter } from "./parser";
import Papa from "papaparse";

// contains the actions that users can take such as inserting and deleting rows, columns, and cells
interface ActionBarProps {
    grid: Array<Array<ICell>>,
    setGrid: React.Dispatch<React.SetStateAction<Cell[][]>>
    styleGrid: Array<Array<React.CSSProperties>>;
    setStyleGrid: React.Dispatch<React.SetStateAction<Array<Array<React.CSSProperties>>>>;
}

function ActionBar(props: ActionBarProps) {
    // should the modal be seen?
    const [showModal, setShowModal] = useState(false);
    // are we setting the value for rows?
    const [isRowValue, setIsRowValue] = useState(false);
    // the corresponding value of the modal input
    const [modalValue, setModalValue] = useState("");
    // the link to download the CSV
    const [exportHref, setExportHref] = useState("");
    // did an error occur in the modal
    const [isError, setIsError] = useState(false);
    // the corresponding error in the modal
    const [error, setError] = useState("");
    // delete or insert
    const [action, setAction] = useState("");

    // given a number finds the corresponding column letter e.g 0 -> A
    const findColumnLetter = (num: number): string => {

        let ans = "";
        while (num >= 0) {
            const c = String.fromCharCode("A".charCodeAt(0) + num % 26)
            ans = c + ans;
            num = Math.floor(num / 26) - 1;
        }
        return ans;
    }

    // inserts a row at index
    const handleInsertRow = (index: number) => {
        // Create an empty row and push it to the index
        let emptyRowSize: number = props.grid[0].length;
        let defaultRow: Array<ICell> = [];
        const emptyStyleRow: Array<React.CSSProperties> = [];

        for (let i = 0; i < emptyRowSize; i++) {
            defaultRow.push(new Cell({ row: index + 1, column: props.grid[0][i].getGridPosition().column }));
            emptyStyleRow.push({});
        }
        
        const newGrid = new Array();
        const newStyleGrid = new Array();

        // Update grid positions
        for (let i = 0; i < props.grid.length + 1; i++) {
            if (i < index) {
                newGrid.push(props.grid[i])
                newStyleGrid.push(props.styleGrid[i]);
            }
            
            else if (i === index) {
                newGrid.push(defaultRow);
                newStyleGrid.push(emptyStyleRow);
            }

            else {
                for (let j = 0; j < props.grid[i - 1].length; j++) {
                    props.grid[i - 1][j].updatePosition({ row: i + 1, column: props.grid[i - 1][j].getGridPosition().column });
                }
                newGrid.push(props.grid[i - 1]);
                newStyleGrid.push(props.styleGrid[i-1]);
            }
        }

        props.setGrid(newGrid);
        props.setStyleGrid(newStyleGrid);
    }
    // inserts a column at index
    const handleInsertColumn = (index: number) => {
        const newGrid = new Array();
        const newStyleGrid = new Array();
        for (let row = 0; row < props.grid.length; row++) {
            const newRow = new Array();
            const newStyleRow = new Array();
            for (let i = 0; i < props.grid[0].length + 1; i++) {
                if (i < index) {
                    newRow.push(props.grid[row][i]);
                    newStyleRow.push(props.styleGrid[row][i]);
                }
                else if (i === index) {
                    newRow.push(new Cell({ row: row + 1, column: props.grid[row][i].getGridPosition().column }));
                    newStyleRow.push({});
                }
                else {
                    props.grid[row][i - 1].updatePosition({ row: row + 1, column: findColumnLetter(i) });
                    newRow.push(props.grid[row][i - 1]);
                    newStyleRow.push(props.styleGrid[row][i-1]);
                }
            }
            newGrid.push(newRow);
            newStyleGrid.push(newStyleRow);
        }

        props.setGrid(newGrid);
        props.setStyleGrid(newStyleGrid);
    }
    // deletes a row at index
    const handleDeleteRow = (index: number) => {
        const newGrid = new Array();
        const newStyleGrid = new Array();
        // Update grid positions
        for (let i = 0; i < props.grid.length; i++) {
            if (i < index) {
                newGrid.push(props.grid[i])
                newStyleGrid.push(props.styleGrid[i]);
            }
            else if (i === index) {
                for (let j = 0; j < props.grid[i].length; j++) {
                    props.grid[i][j].deleteCell();
                }
            }
            else {
                for (let j = 0; j < props.grid[i].length; j++) {
                    props.grid[i][j].updatePosition({ row: i, column: props.grid[i - 1][j].getGridPosition().column });
                }
                newGrid.push(props.grid[i]);
                newStyleGrid.push(props.styleGrid[i]);
            }
        }

        props.setGrid(newGrid);
        props.setStyleGrid(newStyleGrid);
    }
    // deletes a column at index
    const handleDeleteColumn = (index: number) => {
        const newGrid = new Array();
        const newStyleGrid = new Array();

        for (let i = 0; i < props.grid.length; i++) {
            const newRow = new Array();
            const newStyleRow = new Array();

            for (let j = 0; j < props.grid[0].length; j++) {
                if (j < index) {
                    newRow.push(props.grid[i][j]);
                    newStyleRow.push(props.styleGrid[i][j]);
                }
                else if (j === index) {
                    props.grid[i][j].deleteCell();
                }
                else {
                    props.grid[i][j].updatePosition({ row: i + 1, column: findColumnLetter(j - 1) });
                    newRow.push(props.grid[i][j]);
                    newStyleRow.push(props.styleGrid[i][j]);
                }
            }
            newGrid.push(newRow);
            newStyleGrid.push(newStyleRow);
        }
        props.setGrid(newGrid);
        props.setStyleGrid(newStyleGrid);
    }
    // resets all the modal state once the modal gets closed
    const handleClose = () => {
        setModalValue("");
        setShowModal(false);
        setIsError(false);
        setError("");
    }

    // checks if the modal can be submitted, and sets an error otherwise
    const handleModalSubmit = () => {
        let ind = -1;
        if (isRowValue) {
            if (isNaN(Number(modalValue))) {
                setIsError(true);
                setError("Row value must be a number from 1 to " + props.grid.length);
                return;
            }
            const value = Number(modalValue);
            if (value < 1 || value > props.grid.length) {
                setIsError(true);
                setError("Row value must be a number from 1 to " + props.grid.length);
                return;
            }
            setShowModal(false);
            ind = value - 1;
        }
        else {
            if (!isNaN(Number(modalValue))) {
                setIsError(true);
                setError("Column value must compose of capital letters!");
                return;
            }
            let colNum = 0;
            for (let i = 0; i < modalValue.length; i++) {
                if (!isLetter(modalValue[i])) {
                    setIsError(true);
                    setError("Column value must compose of capital letters!");
                    return;
                }
                const char = modalValue.charCodeAt(i) - 'A'.charCodeAt(0) + 1;
                colNum = colNum * 26 + char;
            }
            colNum -= 1;
            if (colNum < 0 || colNum > props.grid[0].length - 1) {
                setIsError(true);
                setError("Column value must compose of capital letters!");
                return;
            }
            setShowModal(false);
            ind = colNum;
        }
        setIsError(false);
        setError("");

        if (action === "insert") {
            if (isRowValue) {
                handleInsertRow(ind);
            }
            else {
                handleInsertColumn(ind);
            }
        }
        else {
            if (isRowValue) {
                handleDeleteRow(ind);
            }
            else {
                handleDeleteColumn(ind);
            }
        }
    }

    // handles importing from a CSV file
    const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Get the file from the input
        // e.preventDefault();
        const file = e.target.files![0];

        // Parse the CSV file into a grid of cells
        Papa.parse(file, {
            complete: function (results: any) {
                const newGrid = new Array();
                // the grid should have at least 100 rows
                const numRows = Math.max(100, results.data.length);
                
                let greatestCol = 0;
                for (const row of results.data) {
                    if (row.length > greatestCol) {
                        greatestCol = row.length;
                    }
                } 
                // Grid should have at least 26 columns
                const numCols = Math.max(26, greatestCol);
                const parser = new Parser(props.grid);

                for (let i = 0; i < numRows; i++) {
                    const newRow = new Array();
                    for (let j = 0; j < numCols; j++) {
                        // If the cell has data, create a new cell with the data
                        if (i < results.data.length && j < results.data[i].length && results.data[i][j] !== '') {
                            const parsedData = results.data[i][j];
                            const cellData = parser.getDataType(parsedData);
                            newRow.push(new Cell({ row: i + 1, column: findColumnLetter(j) }, cellData));
                        } else {
                            // Otherwise, create a new empty cell
                            newRow.push(new Cell({ row: i + 1, column: findColumnLetter(j) }));
                        }
                    }
                    newGrid.push(newRow);
                }
                props.setGrid(newGrid);
            }
        });

        // Clear the file input
        e.target.value = '';
    };

    // generates a CSV representing the grid
    const exportCSV = () => {
        // Get a grid with the raw data from each cell
        const rawDataGrid = new Array();
        let lastDataRow = -1;
        for (let i = 0; i < props.grid.length; i++) {
            const row = new Array();
            let lastDataCol = -1;
            for (let j = 0; j < props.grid[i].length; j++) {
                const rawVal = props.grid[i][j].getRawValue();
                if (rawVal != "") {
                    lastDataCol = j
                }
                row.push(rawVal);
            }
            // row is empty
            if (lastDataCol == -1) {
                // empty rows should be stored as 3 empty cells
                rawDataGrid.push(["","",""]);
            }
            else {
                // only store empty data until the first column which has data
                const shortenedRow = row.slice(0, lastDataCol + 1);
                rawDataGrid.push(shortenedRow);
                lastDataRow = i
            }
        }
        const nonEmptyGrid = rawDataGrid.slice(0, lastDataRow + 1);
        const csv = Papa.unparse(nonEmptyGrid);

        return csv;
    }

    // generates a CSV and the corresponding link
    const handleExportOnClick = () => {
        const blob = new Blob([exportCSV()],  {type: "data:text/csv;charset=utf-8"});
        setExportHref(URL.createObjectURL(blob));
    }
    
    return (
        <>
            <div className="d-flex gap-4">
                <div className="d-flex gap-2">
                    <button className="btn btn-primary insert-row-btn" onClick={() => {
                        setShowModal(true);
                        setIsRowValue(true);
                        setAction("insert");
                    }}>
                        Insert Row
                    </button>
                    <button className="btn btn-primary insert-column-btn" onClick={() => {
                        setShowModal(true);
                        setIsRowValue(false);
                        setAction("insert");
                    }}>
                        Insert Column
                    </button>
                </div>

                <div className="d-flex gap-2">
                    <button className="btn btn-danger delete-row-btn" onClick={() => {
                        setShowModal(true);
                        setIsRowValue(true);
                        setAction("delete");
                    }}>
                        Delete Row
                    </button>
                    <button className="btn btn-danger delete-column-btn" onClick={() => {
                        setShowModal(true);
                        setIsRowValue(false);
                        setAction("delete");
                    }}>
                        Delete Column
                    </button>
                </div>

                <div className="d-flex gap-2">
                    <label className="btn btn-primary">
                        Import CSV
                        <input
                            type="file"
                            accept=".csv"
                            style={{ display: 'none' }}
                            onChange={(e) => handleImportCSV(e)}
                        />
                    </label>
                    <a href={exportHref}
                        download="exported-data.csv"
                        className="btn btn-primary"
                        onClick={handleExportOnClick}>
                        Export CSV
                    </a>
                </div>
            </div>
            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Select {isRowValue ? "Row" : "Column"} value</Modal.Title>

                </Modal.Header>
                {isError ? <Alert variant="danger">
                    {error}
                </Alert> : <></>}
                <Modal.Body>
                    <Form.Control type="text" placeholder={"Enter " + (isRowValue ? "Row" : "Column") + " value"} onChange={(e) => {
                        setModalValue(e.target.value);
                    }} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleModalSubmit}>
                        Submit
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
export default ActionBar