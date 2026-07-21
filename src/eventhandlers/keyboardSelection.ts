import { MAX_COLUMNS, MAX_ROWS } from "../config/constants.js";
import type { Grid } from "../grid.js";
import { Column, Row } from "../utils/rowcolumn.js";
import type { GridState } from "./gridState.js";

export class KeyboardSelection{
    private grid: Grid;
    private gridState : GridState;

    constructor(state: GridState){
        this.gridState = state;
        this.grid = this.gridState.grid;
    }

    public initialize() {
        window.addEventListener('keydown', this.handleArrowKeys);
        window.addEventListener('keydown', this.handleShiftDown);
        window.addEventListener('keyup', this.handleShiftUp);
    }

    public destroyListeners() {
        window.removeEventListener('keydown', this.handleArrowKeys);
        window.removeEventListener('keydown', this.handleShiftDown);
        window.removeEventListener('keyup', this.handleShiftUp);
    }

    private setSelectionEvaluation(): void {
        if (
            this.gridState.selectedRange !== null 
            && this.grid.selection.boundedRange 
            && this.grid.selection.boundedRange.isSame(this.gridState.selectedRange)
        ) return;
        this.gridState.selectedRange = this.grid.selection.boundedRange;
        const evaluation = this.grid.selection.evaluate();
        document.getElementById("field-count")!.textContent = evaluation.count!;
        document.getElementById("field-min")!.textContent = evaluation.min!;
        document.getElementById("field-max")!.textContent = evaluation.max!;
        document.getElementById("field-average")!.textContent = evaluation.average!;
        document.getElementById("field-sum")!.textContent = evaluation.sum!;
    }


    private repositionGrid(): void{
        if (!this.gridState.currentSelectedCell) return;
        const row = this.gridState.currentSelectedCell.row;
        const col = this.gridState.currentSelectedCell.col;
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
            if (this.gridState.isDraggingSelection){
                this.grid.selection.updateDragRange(row,column);

            }
            else {
                this.grid.selection.selectCell(row,column);
            }
        }
        this.gridState.currentSelectedCell = {
            row: row,
            col: column
        };
        this.setSelectionEvaluation();
        this.repositionGrid();
        this.grid.render();
    }

    private handleShiftDown = (e: KeyboardEvent): void => {
        if (document.activeElement === this.gridState.editor) return;
        if (e.key.toLowerCase() === 'shift') {
            this.gridState.isDraggingSelection = true;
        }
    }

    private handleShiftUp = (e: KeyboardEvent): void => {
        if (document.activeElement === this.gridState.editor) return;
        if (e.key.toLowerCase() === 'shift') {
            this.gridState.isDraggingSelection = false;
        }
    }

    private handleArrowKeys = async (e: KeyboardEvent): Promise<void> => {
        if (document.activeElement === this.gridState.editor) return;
        const key = e.key.toLowerCase();
        if (!this.gridState.currentSelectedCell){
            this.gridState.currentSelectedCell = { 
                row: this.grid.selection.activeRow, 
                col: this.grid.selection.activeColumn
            };
        }
        const row = this.gridState.currentSelectedCell.row;
        const col = this.gridState.currentSelectedCell.col;
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
        }
    }

}