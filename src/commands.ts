import { Cell, getSPARSECELLDATA, setSPARSECELLDATA, type CellState } from "./cell.js";
import { Row, Column } from "./rowcolumn.js";
import { addToSheet, fetchFromJson } from "./fetchFromJson.js";

export interface ICommand{
    execute(): void,
    undo(): void
}

export class HistoryManager {
    private undoStack : ICommand[] = [];
    private redoStack : ICommand[] = [];

    public async executeCommand(command: ICommand): Promise<void> {
        await command.execute();
        this.undoStack.push(command);
        this.redoStack = [];
    }
    
    public undo(): void {
        const command = this.undoStack.pop();
        if (!command) return;
        command.undo();
        this.redoStack.push(command);
    }

    public async redo(): Promise<void> {
        const command = this.redoStack.pop();
        if (!command) return;
        await command.execute();
        this.undoStack.push(command);
    }

    public get canRedo(): boolean { return this.redoStack.length > 0; }
    public get canUndo(): boolean { return this.undoStack.length > 0; }
}

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



export class RenderJsonCommand implements ICommand {
    private oldValue: Map<string, CellState> | null = null;
    private newValue: Map<string, CellState> | null = null;

    constructor() {
    }

    async execute() {
        if (!this.newValue) {
            this.oldValue = structuredClone(getSPARSECELLDATA());
            await fetchFromJson();
            this.newValue = structuredClone(getSPARSECELLDATA());
            return;
        }
        setSPARSECELLDATA(this.newValue);
    }

    undo() {
        if (this.oldValue) {
            setSPARSECELLDATA(this.oldValue);
        }
    }
}


export class RenderJsonFromFileCommand implements ICommand {
    private oldValue: Map<string, CellState>;
    private newValue: Map<string, CellState>;

    constructor(data: unknown) {
        this.oldValue = structuredClone(getSPARSECELLDATA());
        addToSheet(data);
        this.newValue = structuredClone(getSPARSECELLDATA());
    }

      execute() {
        setSPARSECELLDATA(this.newValue);
    }

    undo() {
        if (this.oldValue) {
            setSPARSECELLDATA(this.oldValue);
        }
    }
}

