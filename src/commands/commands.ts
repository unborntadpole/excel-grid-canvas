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