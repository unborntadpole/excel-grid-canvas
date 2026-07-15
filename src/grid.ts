import { HistoryManager, TypeActionCommand, ResizeColumnCommand, ResizeRowCommand, RenderJsonCommand, RenderJsonFromFileCommand } from "./commands.js";
import { Cell, Selection } from "./cell.js";
import { GridRenderer } from "./gridRenderer.js";

export class Grid {
    private readonly ctx: CanvasRenderingContext2D;
    public readonly selection: Selection = new Selection();
    private readonly history: HistoryManager = new HistoryManager();
    public renderer: GridRenderer;
    public pointerCell = new Cell();

    public lastRow = 0;
    public lastCol = 0;
    public firstRow = 0;
    public firstCol = 0;

    constructor(private readonly canvas: HTMLCanvasElement){
        const context = this.canvas.getContext('2d');
        if (!context) {
            throw new Error('Grid initialization: Failed to capture 2D context from given canvas element.')
        }
        this.ctx = context;
        this.renderer = new GridRenderer(this.ctx, this.selection, this.canvas);
        this.initDOM();
    }

    private initDOM(): void {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.style.width = `${this.canvas.clientWidth}px`;
        this.canvas.style.height = `${this.canvas.clientHeight}px`;
        this.canvas.width = this.canvas.clientWidth * dpr;
        this.canvas.height = this.canvas.clientHeight * dpr;
    }

    public typeIntoCell(row: number, col: number, value: string): void {
        const cmd = new TypeActionCommand(row, col, value);
        this.history.executeCommand(cmd);
        this.render();
    }

    public async renderJSON(){
        const uid = crypto.randomUUID().toString();
        performance.mark(`load-json-start-${uid}`);
        const cmd = new RenderJsonCommand(`${this.selection.activeRow},${this.selection.activeColumn}`);
        await this.history.executeCommand(cmd);
        performance.mark(`load-json-end-${uid}`);
        this.render();
        performance.measure(`JSON file Load Time ${uid}`, `load-json-start-${uid}`, `load-json-end-${uid}`);
        console.log(`JSON took ${performance.getEntriesByName(`JSON file Load Time ${uid}`)[0]!.duration.toFixed(2)}ms to load.`);
        performance.clearMarks(`load-json-start-${uid}`);
        performance.clearMarks(`load-json-end-${uid}`);
        performance.clearMeasures(`JSON file Load Time ${uid}`);
    }

    public async renderJSONFromFile(data: unknown){
        const cmd = new RenderJsonFromFileCommand(data, `${this.selection.activeRow},${this.selection.activeColumn}`);
        await this.history.executeCommand(cmd);
        this.render();
    }

    public resizeColumn(colNumber: number, width: number): void {
        const cmd = new ResizeColumnCommand(colNumber, width);
        this.history.executeCommand(cmd);
        this.render();
    }

    public resizeRow(rowNumber: number, height: number): void {
        const cmd = new ResizeRowCommand(rowNumber, height);
        this.history.executeCommand(cmd);
        this.render();
    }

    public undo(): void {
        this.history.undo();
        this.render();
    }

    public redo(): void {
        this.history.redo();
        this.render();
    }

    public set scrollX(x: number){
        this.renderer.setScrollX = x;
    }
    public set scrollY(y: number){
        this.renderer.setScrollY = y;
    }    
    public get scrollX(){
        return this.renderer.setScrollX;
    }
    public get scrollY(){
        return this.renderer.setScrollY;
    }

    public render(){
        this.renderer.render();
    }

}