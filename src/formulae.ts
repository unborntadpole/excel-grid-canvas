import { Cell } from "./cell.js";

export function checkFormula(value:string): string{
    value= value.trim();
    if (value[0] == '='){
        const operation = value.slice(1,4);
        // console.log(operation);
        // console.log(value);
        if (value === null) return "";
        const match = value.match(/\(([^)]+)\)/);
        if (match === null || match[1] === undefined) return "INVALID FORMULA";
        const argumentsArray: string[] = match[1].split(",");
        const cells = parseCells(argumentsArray);
        if (cells == null) return "INVALID FORMULA";
        const cellValues = parseCellData(cells);
        if (!cellValues[1] || cellValues[0].length === 0){
            console.log(cellValues[0],cellValues[1]);
            return "NaN";
        }
        switch (operation.toLowerCase()){
            case "sum":
                return ""+sum(cellValues[0]);
            case "mea":
                return ""+mean(cellValues[0]);
            case "med":
                return ""+ median(cellValues[0]);
            case "avg":
                return ""+ mean(cellValues[0]);
        }
        return "INVALID FORMULA";
    }
    return "";
}

function parseCells(cells:string[]): string[] | null{
    let cellsParsed: string[] = [];
    cells.forEach(cell => {
        let key= excelToCoordinatesToValue(cell);
        if (key!=null) cellsParsed.push(key);
    });
    return cellsParsed;
}

function excelToCoordinatesToValue(cell: string): string | null {
    const pointerCell = new Cell();
    const cleanCell = cell.toLowerCase().trim();

    const match = cleanCell.match(/^([a-z]+)([0-9]+)$/);
    if (!match) return null;

    const [_, colLetters = '', rowNumbers = ''] = match;
    if (!colLetters || !rowNumbers) return null;
    const rowIndex = parseInt(rowNumbers, 10) - 1;

    let colIndex = 0;
    for (let i = 0; i < colLetters.length; i++) {
        const charCode = colLetters.charCodeAt(i) - 96;
        colIndex = colIndex * 26 + charCode;
    }
    colIndex = colIndex - 1;

    return pointerCell.bindTo(rowIndex,colIndex).value;
}

function parseCellData(cells:string[]): [number[], boolean]{
    let parsedValues:number[] = [];
    cells.forEach(cell => {
        // console.log(cell);
        const value = parseInt(cell);
        if (Number.isNaN(value)){
            return [[], false];
        }
        else parsedValues.push(value);
    });
    return [parsedValues, true];
}

function sum(cells:number[]): number{
    let total = 0;
    for (const num of cells){
        total += num
    }
    return total;
}

function mean(cells:number[]): number {
    return sum(cells)/cells.length;
}

function median(cells:number[]): number {
    cells = cells.sort((a, b) => a - b);
    const len = cells.length;

    if (len % 2 == 0){
        return (cells[len/2]!+ cells[len/2-1]!)/2 ;
    }
    else return cells[Math.floor(len/2)]! ;
}
