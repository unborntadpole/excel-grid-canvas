import { Cell, type CellRange } from "../cell.js";
import { MAX_COLUMNS, MAX_ROWS } from "../config/constants.js";
import type { CellState } from "../datastore.js";

export interface SelectedCell {
    row: number;
    col: number;
}

export class CopyPaste {
    private copiedValues = new Map<string, CellState>;
    private pointerCell = new Cell();
    private lastrow = 0;
    private lastcol = 0;
    private rows = 0;
    private cols = 0;
    constructor(cellrange: CellRange){
        this.rows = cellrange.endRow - cellrange.startRow;
        this.cols = cellrange.endCol - cellrange.startCol;
        for (let r = cellrange.startRow; r <= cellrange.endRow; r++){
            for (let c = cellrange.startCol; c <=cellrange.endCol; c++){
                const value = this.pointerCell.bindTo(r,c).value;
                const key = `${r - cellrange.startRow},${c - cellrange.startCol}`;
                if (value === ''){
                    continue;
                }
                this.copiedValues.set(key, {value:value});
            }
        }
    }

    public paste(selectedCell: SelectedCell): void{
        const row = selectedCell.row;
        const col = selectedCell.col;
        if (row >= MAX_ROWS || col >= MAX_COLUMNS) return;
        this.lastrow = Math.min(row + this.rows, MAX_ROWS);
        this.lastcol = Math.min(col + this.cols, MAX_COLUMNS);
        for (let r = row; r<=this.lastrow; r++){
            for (let c = col; c<= this.lastcol; c++){
                const state = this.copiedValues.get(`${r - row},${c - col}`);
                if (state){
                    this.pointerCell.bindTo(r,c).setRawValue(state.value);
                }
            }
        }
    }

}
