import type { Grid } from "../../grid.js";
import { CopyPaste } from "../../utils/copypaste.js";
import type { GridState } from "../gridState.js";
import type { KeyboardHandler } from "./keyboardController.js";

export class KeyboardCopyPaste implements KeyboardHandler {
    private grid: Grid;
    private copyObject: CopyPaste | null = null;

    constructor(private gridState: GridState){
        this.grid = this.gridState.grid;
    }

    public hitTest(e: KeyboardEvent, key: string): boolean {
        if (this.gridState.editing.getCurrentEditingCell()) return false;
        if (e.ctrlKey && e.code == 'KeyC' ||  e.code == 'KeyV') return true;
        return false;
    }

    public keyDown(e: KeyboardEvent, key: string): void {
        switch(e.code) {
            case "KeyC":
                e.preventDefault();
                const range = this.grid.selection.boundedRange;
                if (!range) return;
                this.copyObject = new CopyPaste(range);
                break;
            case "KeyV":
                e.preventDefault();
                if (this.copyObject){
                    this.grid.paste(
                        this.copyObject,
                        this.grid.selection.activeRow,
                        this.grid.selection.activeColumn
                    );
                    this.gridState.canvas.focus();
                }
                break;
        }
    }
    public keyUp(e: KeyboardEvent, key: string): void {}
}