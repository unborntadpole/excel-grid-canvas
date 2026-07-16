import { Cell, type CellRange } from "../cell.js";

function getCellValues(bRng:CellRange): number[] {
    const pointerCell = new Cell();
    let cells: number[] = [];
    for (let i = bRng.startRow; i<= bRng.endRow; i++){
        for (let j = bRng.startCol; j<= bRng.endCol; j++){
            const value = pointerCell.bindTo(i,j).value;
            if (value === ""){
                continue;
            }
            if (!isNaN(Number(value)) && value.trim() !== ""){
                cells.push(parseInt(value));
            }
        }
    }
    return cells;
}

export function getEvaluation(bRng:CellRange): Record<string,string>{
    let values: number[] = getCellValues(bRng);
    const count = "" + values.length;
    let min = "NaN";
    let max = "NaN";
    let average = "NaN";
    let sumString = "NaN";
    if (values.length != 0){
        values = values.sort((a, b) => a - b);
        min = "" + values[0];
        max = "" + values.at(-1);
        sumString = "" + sum(values);
        average = "" + mean(values).toFixed(2);
    }
    return {
        "count" : count,
        "min": min,
        "max": max,
        "average": average,
        "sum": sumString
    }
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
