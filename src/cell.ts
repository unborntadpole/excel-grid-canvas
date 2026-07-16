import { MAX_COLUMNS, MAX_ROWS } from "./config/constants.js";
import { getEvaluation } from "./utils/selectionFunctions.js";

export class Cell {
    public row: number = 0;
    public column: number = 0;

    public bindTo(row: number, col: number): this  {
        this.column = col;
        this.row = row;
        return this;
    }

    public get key(): string {
        if (this.row >= MAX_ROWS || this.column >= MAX_COLUMNS) return "INVALID";
        return `${this.row},${this.column}`;
    }

    public get value(): string {
        if (!window.__datastore) {
            console.error('failed to connect to datastore');
            return '';
        };
        const state = window.__datastore.getCellData(this.key);
        return state ? state.value : '';
    }

    public setRawValue(val: string): void {
        if (!window.__datastore) {
            console.error('failed to load datastore');
            return;
        }
        window.__datastore.setRawValue(this.key, val);
    }
}

export class CellRange {
    public readonly startRow: number;
    public readonly startCol: number;
    public readonly endRow: number;
    public readonly endCol: number;

    constructor(startRow: number, startCol: number, endRow: number, endCol: number){
        this.startRow = Math.min(startRow, endRow);
        this.endRow = Math.max(startRow, endRow);
        this.startCol = Math.min(startCol, endCol);
        this.endCol = Math.max(startCol, endCol);
    }
    public contains(row: number, col: number): boolean {
        return row >= this.startRow 
            && row <= this.endRow
            && col >= this.startCol
            && col <= this.endCol;
    }
    public isSame(cellrange: CellRange): boolean{
        if (
            this.startRow == cellrange.startRow
            && this.endRow == cellrange.endRow
            && this.startCol == cellrange.startCol
            && this.endCol == cellrange.endCol
        ){
            return true;
        }
        return false;
    }
}

export class Selection {
    public activeRow: number = 0;
    public activeColumn: number = 0;
    public boundedRange: CellRange |  null = null;

    public selectCell(row: number, col: number): void {
        this.activeRow = row;
        this.activeColumn = col;
        this.boundedRange = new CellRange(row, col, row, col);
    }

    public updateDragRange(targetRow: number, targetCol: number): void {
        this.boundedRange = new CellRange(this.activeRow, this.activeColumn, targetRow, targetCol);
    }

    public evaluate(): Record<string, string>{
        if (this.boundedRange === null) return {
            "count" : "0",
            "min": "",
            "max": "",
            "average": "",
            "sum": ""
        };
        return getEvaluation(this.boundedRange);
    }
}