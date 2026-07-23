import { DataStore } from "../datastore.js";
import { Grid } from "../grid.js";
import { EditCell } from "../editing.js";

export interface GridState {
    container: HTMLDivElement;
    spacer: HTMLDivElement;
    canvas: HTMLCanvasElement;
    editor: HTMLInputElement;
    fileInput: HTMLInputElement;
    grid: Grid;
    datastore: DataStore;
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
        this.lastClick = 0;
        performance.mark('grid-init-start');
        this.grid = new Grid(this.canvas);
        this.editing = new EditCell(this);
    }
    public timeClick(): void {
        this.lastClick = performance.now();
    }
}