import type { Grid } from "../../grid.js";
import type { GridState } from "../gridState.js";
import type { KeyboardHandler } from "./keyboardController.js";

export class KeyboardImportJson implements KeyboardHandler {
    private grid: Grid;

    constructor(private gridState: GridState){
        this.grid = this.gridState.grid;
    }

    public hitTest(e: KeyboardEvent, key: string): boolean {
        if (this.gridState.editing.getCurrentEditingCell()) return false;
        if (e.ctrlKey && e.code == 'KeyI' ||  e.code == 'KeyO') return true;
        return false;
    }

    public async keyDown(e: KeyboardEvent, key: string): Promise<void> {
        switch(e.code) {
            case "KeyI":
                e.preventDefault();
                await this.grid.renderJSON();
                break;
            case "KeyO":
                e.preventDefault();
                document.getElementById('loaded-file')?.click();
                break;
        }
    }
    public keyUp(e: KeyboardEvent, key: string): void {}
}