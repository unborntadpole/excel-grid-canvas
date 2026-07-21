import { CellRange } from "../cell.js";
import { DataStore } from "../datastore.js";
import { Grid } from "../grid.js";
import { CopyPaste } from "../utils/copypaste.js";
import { EditCell } from "./mouse/cellEditing.js";

export interface GridState {
    container: HTMLDivElement;
    spacer: HTMLDivElement;
    canvas: HTMLCanvasElement;
    editor: HTMLInputElement;
    fileInput: HTMLInputElement;
    grid: Grid;
    datastore: DataStore;
    isDraggingSelection: boolean;
    isResizingColumn: boolean;
    isResizingRow: boolean;
    selectedRange: CellRange | null;
    activeResizeIndex: number;
    initialMousePos: number;
    initialSize: number;
    copyObject: CopyPaste | null;
    currentEditingCell: { row: number; col: number } | null;
    currentSelectedCell: { row:number; col: number } | null;
    lastClick: number;
    editing: EditCell;
}

export class GridState implements GridState {
    constructor(){
        this.container = document.getElementById('grid-container') as HTMLDivElement;
        this.spacer = document.getElementById('grid-spacer') as HTMLDivElement;
        this.canvas = document.getElementById('my-grid-canvas') as HTMLCanvasElement;
        this.editor = document.getElementById('grid-editor') as HTMLInputElement;
        this.fileInput = document.getElementById('loaded-file') as HTMLInputElement;
        this.datastore = new DataStore();
        this.isDraggingSelection = false;
        this.isResizingColumn = false;
        this.isResizingRow = false;
        this.selectedRange = null;
        this.activeResizeIndex = -1;
        this.initialMousePos = 0;
        this.initialSize = 0;
        this.copyObject = null;
        this.currentEditingCell = null;
        this.currentSelectedCell = null;
        this.lastClick = 0;
        performance.mark('grid-init-start');
        this.grid = new Grid(this.canvas);
        this.editing = new EditCell(this);
    }
    public timeClick(): void {
        this.lastClick = performance.now();
    }
}