import type { Grid } from "../../grid.js";
import type { GridState } from "../gridState.js";
import type { KeyboardHandler } from "./keyboardController.js";

export class KeyboardUndoRedo implements KeyboardHandler {
    private grid: Grid;

    constructor(private gridState: GridState){
        this.grid = this.gridState.grid;
    }

    public hitTest(e: KeyboardEvent, key: string): boolean {
        if (this.gridState.editing.getCurrentEditingCell()) return false;
        if (e.ctrlKey || e.metaKey && e.code == 'KeyZ' ||  e.code == 'KeyY') return true;
        return false;
    }

    public async keyDown(e: KeyboardEvent, key: string): Promise<void> {
        switch(e.code) {
            case "KeyZ":
                e.preventDefault();
                if (e.shiftKey) this.grid.redo();
                else this.grid.undo();
                break;
            case "KeyY":
                e.preventDefault();
                this.grid.redo();
                break;
        }
    }
    public keyUp(e: KeyboardEvent, key: string): void {}
}