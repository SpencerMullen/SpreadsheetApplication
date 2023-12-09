# CS4530 Course Project - Spreadsheet Application
## Team 505
Sebastian Wittrock, Spencer Mullen, Cynthia Cao, Vanessa Le

## Deployed on render here:
- https://spreadsheet-app.onrender.com

## Installation Instructions

1. Clone the code on main from https://github.com/neu-cs4530-fall2023/team505-project
2. Navigate to the cloned directory and go to the implementation/spreadsheet-app/ folder
3. Run 'npm i -g pnpm' to install pnpm 
4. Run 'pnpm i' to install dependencies
5. Run 'pnpm dev' to start the app
6. To run model tests you can run pnpm test

## Core Features

The spreadsheet app supports numbers, strings, functions, references, and range expressions as inputs.
To start writing in a cell, double click the cell you want to modify.
To write references to other cells, write them of the form REF(A1), where A1 is the column letters then row number
To write a Sum Range expression do SUM(A1..C1) where A1 is the start of the range and C1 is the end of the range
To write Average Range expressions do AVERAGE(A1..C1) where A1 is the start of the range and C1 is the end of the range
Range expressions and references account for circular references errors where there can be loops in cell references

## Additional Features

### Export CSVs

The spreadsheet allows users to export their current spreadsheet as a CSV file which is saved to the browser's default downloads location.

### Import CSVs

Using any saved CSVs of spreadsheets that were exported, users can import any selected CSV to load the data into the spreadsheet.

### Cell Formatting

Cells can be formatted with background color and text color. Cell content can be formatted with bold, italics, and strikethrough.

### Conditional Formatting

Users can add 'rules' to the spreadsheet which apply formatting conditionally depending on if the cell adheres to the rule.
