import { getEvaluation } from "./selectionFunctions.js";

export interface CellState {
    value: string
}
let SPARSE_CELL_DATA = new Map<string, CellState>();

export function setSPARSECELLDATA(data: Map<string, CellState>){
    SPARSE_CELL_DATA = structuredClone(data);
}

export function getSPARSECELLDATA(): Map<string, CellState>{
    return structuredClone(SPARSE_CELL_DATA);
}

export class Cell {
    public row: number = 0;
    public column: number = 0;

    public bindTo(row: number, col: number): this  {
        this.column = col;
        this.row = row;
        return this;
    }

    public get key(): string {
        return `${this.row},${this.column}`;
    }

    public get value(): string {
        const state = SPARSE_CELL_DATA.get(this.key);
        return state ? state.value : '';
    }

    public setRawValue(val: string): void {
        if (val === ''){
            SPARSE_CELL_DATA.delete(this.key);
        } 
        else{
            const state = SPARSE_CELL_DATA.get(this.key);
            if (state){
                state.value = val;
            } 
            else{
                SPARSE_CELL_DATA.set(this.key, {value: val});
            }
        }
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
        if (this.boundedRange === null) return {};
        return getEvaluation(this.boundedRange);
    }
}