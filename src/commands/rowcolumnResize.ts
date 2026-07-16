import type { ICommand } from "./commands.js";
import { Column, Row } from "../utils/rowcolumn.js";

export class ResizeColumnCommand implements ICommand {
    private oldWidth: number;
    
    constructor(
        private readonly colNumber: number,
        private readonly newValue: number
    ) {
        this.oldWidth = Column.getWidth(colNumber);
    }

    public execute(): void{
        Column.setWidth(this.colNumber, this.newValue);
    }

    public undo(): void{
        Column.setWidth(this.colNumber, this.oldWidth);
    }
}

export class ResizeRowCommand implements ICommand {
    private oldHeight: number;
    
    constructor(
        private readonly rowNumber: number,
        private readonly newValue: number
    ) {
        this.oldHeight = Row.getHeight(rowNumber);
    }

    public execute(): void{
        Row.setHeight(this.rowNumber, this.newValue);
    }

    public undo(): void{
        Row.setHeight(this.rowNumber, this.oldHeight);
    }
}

