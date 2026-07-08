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
        switch (operation.toLowerCase()){
            case "sum":
                // console.log(cells);

                return "sum operation";
            case "mea":
                return "mean operation";
            case "med":
                return "median operation";
        }
        return "INVALID FORMULA";
    }
    return "";
}

function parseCells(cells:string[]): string[] | null{
    let cellsParsed: string[] = [];
    cells.forEach(cell => {
        let key = excelToCoordinates(cell);
        if (key!=null) cellsParsed.push(key);
    });
    return cellsParsed;
}

function excelToCoordinates(cell: string): string | null {
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
    return `${rowIndex},${colIndex}`;
}

function sum(cells:string[]): string{
    
    return "";
}
