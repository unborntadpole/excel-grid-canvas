import { Cell } from "../cell.js";
import type { ICommand } from "./commands.js";

export class TypeActionCommand implements ICommand {
    private oldValue: string;
    private pointerCell: Cell = new Cell;

    constructor(
        private readonly row: number, 
        private readonly col: number, 
        private readonly newValue: string
    ){
        this.oldValue = this.pointerCell.bindTo(row, col).value;
    }

    execute(){
        this.pointerCell
            .bindTo(this.row, this.col)
            .setRawValue(this.newValue);
    }

    undo(){
        this.pointerCell
            .bindTo(this.row, this.col)
            .setRawValue(this.oldValue);
    }
}

