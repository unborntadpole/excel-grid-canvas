import type { CellState, DataStore } from "../datastore.js";
import type { CopyPaste, SelectedCell } from "../utils/copypaste.js";
import type { ICommand } from "./commands.js";


export class PasteCommand implements ICommand{
    private oldValue: Map<string, CellState> | null = null;
    private repo: DataStore | null = null;
    private copyObject: CopyPaste | null = null;
    private cell: SelectedCell | null = null;

    constructor(copyObject: CopyPaste, row: number, col: number){
        if (window.__datastore) this.repo = window.__datastore;
        this.copyObject = copyObject;
        this.cell = {
            'row': row,
            'col': col
        };
    }

    execute(){
        if (!this.repo || !this.copyObject || !this.cell) {
            console.error('failed to execute paste');
            return;
        };
        this.oldValue = this.repo.getSPARSECELLDATA();
        this.copyObject.paste(this.cell);
    }
    undo(){
        if (!this.repo || !this.copyObject) {
            console.error('failed to connect to datastore');
            return;
        };
        if (this.oldValue){
            this.repo.setSPARSECELLDATA(this.oldValue);
        }
    }
}