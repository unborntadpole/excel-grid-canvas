import { Cell, CellRange, Selection } from "./cell.js";
import { mean, parseCellData, sum } from "./formulae.js";


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
        average = "" + mean(values);
    }
    return {
        "count" : count,
        "min": min,
        "max": max,
        "average": average,
        "sum": sumString
    }
}