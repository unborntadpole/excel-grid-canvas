import { MAX_COLUMNS, MAX_ROWS } from "../../config/constants.js";
import type { Grid } from "../../grid.js";
import { Column, Row } from "../../utils/rowcolumn.js";
import type { GridState } from "../gridState.js";
import type { KeyboardHandler } from "./keyboardController.js";

export class KeyboardSelection implements KeyboardHandler {
    private grid: Grid;
    private activeCell : {row:number, col:number} | null = null;
    private selectedCell : {row:number, col:number} | null = null;
    private shiftOn: boolean = false;
    private keys: string[] = ["arrowup","arrowdown","arrowleft","arrowright","shift"];

    constructor(private gridState: GridState){
        this.grid = this.gridState.grid;
    }

    public hitTest(e: KeyboardEvent, key: string): boolean {
        if (this.gridState.editing.getCurrentEditingCell()) return false;

        if (this.keys.includes(key.toLowerCase()))
            return true;

        return false;
    }

    public keyDown(e: KeyboardEvent, key: string): void {
        key = key.toLowerCase();
        this.setActiveCell();
        if (!this.selectedCell) {
            this.selectedCell = structuredClone(this.activeCell!);
        }
        const row = this.selectedCell.row;
        const col = this.selectedCell.col;
        switch(key) {
            case "arrowup":
                e.preventDefault();
                this.setSelectedCell(Math.max(0, row - 1), col);
                break;
            case "arrowdown":
                e.preventDefault();
                this.setSelectedCell(Math.min(MAX_ROWS, row + 1), col);
                break;
            case "arrowright":
                e.preventDefault();
                this.setSelectedCell(row, Math.min(col + 1, MAX_COLUMNS));
                break;
            case "arrowleft":
                e.preventDefault();
                this.setSelectedCell(row, Math.max(0, col -1));
                break;
            case "shift":
                e.preventDefault();
                this.shiftOn = true;
        }
    }
    public keyUp(e: KeyboardEvent, key: string): void {
        key = key.toLowerCase();
        if (key === "shift"){
            e.preventDefault();
            this.shiftOn = false;
        }
    }

    private setActiveCell(): void{
        const newActiveCell = { 
            row: this.grid.selection.activeRow, 
            col: this.grid.selection.activeColumn
        };
        if (!this.activeCell) {
            this.activeCell = newActiveCell;
        }
        if (
            this.activeCell.row != newActiveCell.row 
            && this.activeCell.col != newActiveCell.col
        ) {
            this.selectedCell = newActiveCell;
        };
        this.activeCell = newActiveCell;
    }

    private setSelectionEvaluation(): void {
        
        if (!this.grid.selection.boundedRange) return;
        const evaluation = this.grid.selection.evaluate();
        document.getElementById("field-count")!.textContent = evaluation.count!;
        document.getElementById("field-min")!.textContent = evaluation.min!;
        document.getElementById("field-max")!.textContent = evaluation.max!;
        document.getElementById("field-average")!.textContent = evaluation.average!;
        document.getElementById("field-sum")!.textContent = evaluation.sum!;
    }


    private repositionGrid(): void{
        if (!this.selectedCell) return;
        const row = this.selectedCell.row;
        const col = this.selectedCell.col;
        const gridFirstLastCells = this.grid.renderer.gridFirstLastCells;
        const rowlast = gridFirstLastCells.lr!;
        const collast = gridFirstLastCells.lc!;
        const rowfirst = gridFirstLastCells.fr!;
        const colfirst = gridFirstLastCells.fc!;

        if (row == 0){
            if (col == 0){
                this.gridState.container.scrollTop = 0;
                this.gridState.container.scrollLeft = 0;
                return;
            }
            else{
                this.gridState.container.scrollTop = 0;
            }
        } else if (col == 0){
            this.gridState.container.scrollLeft = 0;
        }
        
        let changeX = 0;
        let changeY = 0;
        if (row > rowlast){
            for(let rowT = row; rowT >= rowlast; rowT--){
                changeY += Row.getHeight(rowT);
            }
        } 
        else if ( row < rowfirst){
            for(let rowT = row; rowT <= rowfirst; rowT++){
                changeY -= Row.getHeight(rowT);
            }
        }
        else if ( col > collast){
            for(let colT = col; colT >= collast; colT--){
                changeX += Column.getWidth(colT);
            }
        }
        else if ( col < colfirst){
            for(let colT = col; colT <= colfirst; colT++){
                changeX -= Column.getWidth(colT);
            }
        }
        this.gridState.container.scrollLeft += changeX;
        this.gridState.container.scrollTop += changeY;
    }


    private setSelectedCell(row: number, column: number): void {
        if (this.grid.selection.boundedRange === null){
            this.grid.selection.selectCell(0,0);
            this.gridState.container.scrollLeft = 0;
            this.gridState.container.scrollTop = 0;
        }
        else{
            if (this.shiftOn){
                this.grid.selection.updateDragRange(row,column);
            }
            else {
                this.grid.selection.selectCell(row,column);
            }
            this.selectedCell = {
                row: row,
                col: column
            };
        }

        this.setSelectionEvaluation();
        this.repositionGrid();
        this.grid.render();
    }
}