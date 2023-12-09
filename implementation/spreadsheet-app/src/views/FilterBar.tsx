import React, { useMemo, useState } from "react";
import { Alert, Button, Dropdown, Form, Modal } from "react-bootstrap";
import IPredicate from "../interfaces/ipredicate.interface";
import { Greater } from "../models/greater-model";
import { Less } from "../models/less-model";
import { Equal } from "../models/equal-model";
import { Empty } from "../models/empty-model";
import { Not } from "../models/not-model";

interface filterBarProps {
    styleGrid: Array<Array<React.CSSProperties>>;
    setStyleGrid: React.Dispatch<React.SetStateAction<Array<Array<React.CSSProperties>>>>;
    curPos: Array<number>;
    condFilters: Array<IPredicate>;
    setCondFilters: React.Dispatch<React.SetStateAction<Array<IPredicate>>>;
}

// Represents a bar with all the formatting
export function FilterBar({styleGrid: gridFilters, setStyleGrid: setGridFilters, curPos, condFilters, setCondFilters}: filterBarProps) {
    // should the conditional formatting modal be shown?
    const [showCondModal, setShowCondModal] = useState(false);
    // should the editing modal be shown?
    const [showEditModal, setShowEditModal] = useState(false);

    // is there an error within the conditional formatting modal?
    const [isError, setIsError] = useState(false);

    // the conditional formatting operation
    const [condOp, setCondOp] = useState("Operations");
    // the conditional formatting input value
    const [condValue, setCondValue] = useState("");
    // is not being applied to the condition
    const [condNot, setCondNot] = useState(false);
    
    // is bold being applied in conditional formatting
    const [isBold, setIsBold] = useState(false);
    // is italic being applied in conditional formatting
    const [isItalic, setIsItalic] = useState(false);
    // is line-through being applied in conditional formatting
    const [isLineThrough, setIsLineThrough] = useState(false);
    // what background color is being selected
    const [backgroundColor, setBackgroundColor] = useState("");
    // what text color is being selected
    const [textColor, setTextColor] = useState("");
    // a set containing the indices of which conditional formats to delete
    const [stylesToDelete, setStylesToDelete] = useState<Set<number>>(new Set());

    // handles choosing a style for a single cell
    const handleStyle = (style: string) => {
        // if style is already in the style object remove it
        const curCellStyles = gridFilters[curPos[0]][curPos[1]];
        const gridStyleCopy = [...gridFilters];
        let copyCellStyles = {...curCellStyles};

        let styleName : keyof React.CSSProperties = "fontWeight";
        // gets the corresponding style name
        switch (style) {
            case "bold":
                styleName = "fontWeight";
                break;
            case "italic":
                styleName = "fontStyle";
                break;
            case "line-through":
                styleName = "textDecoration";
                break;
            default:
                break;
        }
        // include the style if it doesn't exist
        if (!Object.keys(curCellStyles).includes(styleName)) {
            copyCellStyles[styleName] = style;
        }
        // remove the style otherwise
        else {
            const {[styleName]: removeStyle, ...rest} = curCellStyles;
            copyCellStyles = rest;
        }
        gridStyleCopy[curPos[0]][curPos[1]] = copyCellStyles;
        setGridFilters(gridStyleCopy);
    }

    // handles closing the conditional formatting modal by resetting all values
    const handleCondClose = () => {
        setShowCondModal(false);
        setCondOp("Operations");
        setCondNot(false);
        setCondValue("");
        setIsBold(false);
        setIsItalic(false);
        setIsLineThrough(false);
        setBackgroundColor("");
        setTextColor("");
    }
    // handles choosing an operation
    const handleOpSelect = (op: string) => {
        setCondOp(op);
    }
    // handles updating the value within conditional formatting
    const handleValueUpdate = (e) => {
        setCondValue(e.target.value);
    }
    // toggles the NOT operation
    const handleCondNot = () => {
        setCondNot(!condNot);
    }
    // submits the conditional formatting modal
    const handleCondSubmit = () => {
        // an operation must be present
        if (condOp == "Operations") {
            setIsError(true);
            return;
        }
        const styles : React.CSSProperties = {};
        if (isBold) {
            styles.fontWeight = "bold";
        }
        if (isItalic) {
            styles.fontStyle = "italic";
        }
        if (isLineThrough) {
            styles.textDecoration = "line-through";
        }

        const hexColorRegex = /^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$/;
        // add them if they're valid hex colors
        if (hexColorRegex.test(backgroundColor)) {
            styles.backgroundColor = backgroundColor
        }
        if (hexColorRegex.test(textColor)) {
            styles.color = textColor
        }

        // creates the corresponding IPredicate object depending on the operation
        if (Object.keys(styles).length != 0) {
            let pred = null;
            if (condOp == ">") {
                pred = new Greater(condValue, styles);
            }
            else if (condOp == "<") {
                pred = new Less(condValue, styles);
            }
            else if (condOp == "=") {
                pred = new Equal(condValue, styles);
            }
            else {
                pred = new Empty(styles);
            }
            
            if (condNot) {
                pred = new Not(pred, styles);
            }

            const filterCopy = [...condFilters];
            filterCopy.push(pred);
            setCondFilters(filterCopy);
        }
        handleCondClose();
    }
    // updates the background color 
    const handleBackgroundColorUpdate = (e) => {
        setBackgroundColor(e.target.value);
    }
    // updates the text color
    const handleTextColorUpdate = (e) => {
        setTextColor(e.target.value);
    }
    // represents the condition for conditional formatting
    const conditionToString = useMemo(() => {
        if (condOp == "Operations") {
            return "";
        }
        let result = condNot ? "NOT CellValue " : "CellValue ";
        result += condOp + " ";
        result += (condOp == "isEmpty") ? "" : condValue;
        return result;
    }, [condNot, condOp, condValue]);

    // handles closing the edit modal
    const handleEditClose = () => {
        setShowEditModal(false);
        setStylesToDelete(new Set());
    }

    // handles submitting the edit modal
    const handleEditSubmit = () => {
        const newCondFilters = new Array<IPredicate>();
        for (let i = 0; i < condFilters.length; i++) {
            if (!stylesToDelete.has(i)) {
                newCondFilters.push(condFilters[i]);
            }
        }
        setCondFilters(newCondFilters);
        handleEditClose();
    }
    
    return <div className="filterBarContainer">
        <Button variant="dark" onClick={()=>{
            handleStyle("bold")
        }}>Bold</Button>
        <Button variant="dark" onClick={()=>{
            handleStyle("italic")
        }}>Italic</Button>
        <Button variant="dark" onClick={()=>{
            handleStyle("line-through")
        }}>Strikethrough</Button>
        <Button variant="dark" onClick={()=>{
            setShowCondModal(true);
        }}>Conditional Formatting</Button>
        <Button variant="dark" onClick={()=> {
            setShowEditModal(true);
        }}>Edit Formatting</Button>

        <Modal show={showCondModal} onHide={handleCondClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Custom Formatting</Modal.Title>

                </Modal.Header>
                {isError ? <Alert variant="danger">
                    Operation must be specified!
                </Alert> : <></>}
                <Modal.Body>
                <div className="conditionalForm">
                    <Form.Check type={"checkbox"} label={"Not"} onClick={handleCondNot}/>
                    <Dropdown onSelect={(e)=>{
                        if (e) {
                            handleOpSelect(e);
                        }
                        }}>
                        <Dropdown.Toggle variant="success">
                            {condOp}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item eventKey={">"}>greater than</Dropdown.Item>
                            <Dropdown.Item eventKey={"<"}>less than</Dropdown.Item>
                            <Dropdown.Item eventKey={"="}>equal</Dropdown.Item>
                            <Dropdown.Item eventKey={"isEmpty"}>empty</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    
                    {(condOp != "isEmpty") ? <Form.Control 
                        type="text"
                        placeholder="e.g 45 or abc"
                        onChange={handleValueUpdate}
                    /> : <></> }
                </div>
                <hr />
                <div className="styleRows">
                    <div className="styleRow">
                        <Form.Check type={"checkbox"} label={"Bold"} onClick={()=>{setIsBold(!isBold)}}/>
                        <Form.Check type={"checkbox"} label={"Italic"} onClick={()=>{setIsItalic(!isItalic)}}/>
                        <Form.Check type={"checkbox"} label={"Strikethrough"} onClick={()=>{setIsLineThrough(!isLineThrough)}}/>
                    </div>
                    <div className="styleRow">
                        <div>Background Color: </div>
                        <Form.Control type="text" placeholder="a hex value of the form #ABCDEF" onChange={handleBackgroundColorUpdate}/>
                    </div>
                    <div className="styleRow">
                        <div>Text Color: </div>
                        <Form.Control type="text" placeholder="a hex value of the form #ABCDEF" onChange={handleTextColorUpdate}/>
                    </div>
                </div>
                <hr />
                <div className="condition">
                    {conditionToString}
                </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCondClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleCondSubmit}>
                        Submit
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showEditModal} onHide={handleEditClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Remove Conditional Formatting</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {condFilters.map((pred: IPredicate, index: number) => {
                        return <div key={index} className="editRow">
                            <div>{pred.toString()}</div>
                            <Form.Check type="checkbox" onClick={()=> {
                                let filtersTDCopy = new Set(stylesToDelete);
                                if (stylesToDelete.has(index)) {
                                    // remove it from set;
                                    filtersTDCopy.delete(index);
                                }
                                else {
                                    // add it to set
                                    filtersTDCopy.add(index);
                                }
                                setStylesToDelete(filtersTDCopy);
                            }}/>
                        </div>
                    })}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleEditClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleEditSubmit}>
                        Submit
                    </Button>
                </Modal.Footer>
            </Modal>
    </div>
}