// import { useMemo, useState } from 'react'
import GridComponent from './views/Grid'
import ActionBar from './views/ActionBar'
import Cell from './models/cell.model'
import { useState } from 'react';

const rows = 100;
const initialCells = new Array();
// initializes an empty grid with 100 rows and columns A-Z
for (let i = 0; i < rows; i++) {
  const row = new Array();
  for (let j = 'A'.charCodeAt(0); j <= 'Z'.charCodeAt(0); j++) {
    const capitalLetter = String.fromCharCode(j);
    row.push(new Cell({row: i+1, column:capitalLetter}))
  }
  initialCells.push(row);
}


// creates an empty grid representing the styles on each cell
const emptyStyleGrid = new Array<Array<React.CSSProperties>>();
    
for (let row = 0; row < initialCells.length; row++) {
    const newRow = new Array<React.CSSProperties>();
    for (let col = 0; col < initialCells[row].length; col++) {
        newRow.push({});
    }
    emptyStyleGrid.push(newRow);
}




function App() {
  const [cells, setCells] = useState<Array<Array<Cell>>>(initialCells)
  // grid containing styles for each cell
  const [styleGrid, setStyleGrid] = useState<Array<Array<React.CSSProperties>>>(emptyStyleGrid);

  
  return (
    <>
      <div className="action-bar gap-4">
        <h3 className="pb-2">{"Spreadsheet"}</h3>
        <ActionBar grid={cells} setGrid={setCells} styleGrid={styleGrid} setStyleGrid={setStyleGrid}/>
      </div>
      <div className='gridContainer'>
        <GridComponent cells={cells} styleGrid={styleGrid} setStyleGrid={setStyleGrid}/>
      </div>
    </>
  )
}

export default App
