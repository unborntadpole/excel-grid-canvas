import type { Grid } from "../../grid.js";
import type { GridState } from "../gridState.js";
import type { EditCell } from "../../editing.js";
import type { KeyboardHandler } from "./keyboardController.js";

export class KeyboardEditing implements KeyboardHandler {
    private grid: Grid;
    private activeCell : {row:number, col:number} | null = null;
    private editing: EditCell;
    private keys: string[] = ["enter","escape"];

    constructor(private gridState: GridState){
        this.grid = this.gridState.grid;
        this.editing = this.gridState.editing;
    }

    public hitTest(e: KeyboardEvent, key: string): boolean {

        if (this.keys.includes(key.toLowerCase())) return true;
        if (this.editing.getCurrentEditingCell()) return true;
        return false;
    }

    public keyDown(e: KeyboardEvent, key: string): void {
        key = key.toLowerCase();
        this.activeCell = { 
            row: this.grid.selection.activeRow, 
            col: this.grid.selection.activeColumn
        };
        const row = this.activeCell.row;
        const col = this.activeCell.col;

        if (
            this.editing.getCurrentEditingCell() === null 
            && key === "enter"
        ) {
            this.editing.startEditing({row,col});
            return;
        }

        switch(key) {
            case "enter":
                e.preventDefault();
                this.editing.commitEditingChanges();
                this.gridState.canvas.focus();
                break;
            case "escape":
                e.preventDefault();
                this.editing.cancelEditing();
                this.gridState.canvas.focus();
                break;
        }
    }
    public keyUp(e: KeyboardEvent, key: string): void {}
}