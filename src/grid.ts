import { MAX_ROWS, MAX_COLUMNS } from "./script.js";
import { Row, Column } from "./rowcolumn.js";
import { HistoryManager, TypeActionCommand, ResizeColumnCommand, ResizeRowCommand, RenderJsonCommand, RenderJsonFromFileCommand } from "./commands.js";
import { Cell, Selection } from "./cell.js";
import { checkFormula } from "./formulae.js";

export class Grid {
    private readonly ctx: CanvasRenderingContext2D;
    public readonly selection: Selection = new Selection();
    private readonly history: HistoryManager = new HistoryManager();

    private readonly pointerCell: Cell = new Cell();

    public scrollX: number = 0;
    public scrollY: number = 0;

    constructor(private readonly canvas: HTMLCanvasElement){
        const context = this.canvas.getContext('2d');
        if (!context) {
            throw new Error('Grid initialization: Failed to capture 2D context from given canvas element.')
        }
        this.ctx = context;
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
        const cmd = new RenderJsonCommand();
        await this.history.executeCommand(cmd);
        this.render();
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

    public render(): void {
        const ctx = this.ctx;
        const dpr = window.devicePixelRatio || 1;
        const viewW = this.canvas.width / dpr;
        const viewH = this.canvas.height / dpr;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.scale(dpr, dpr);

        let currentY = 0;
        for (let r = 0; r < MAX_ROWS; r++) {
            const rh = Row.getHeight(r);
            if (currentY + rh >= this.scrollY && currentY <= this.scrollY + viewH){
                let currentX = 0;

                for(let c = 0; c < MAX_COLUMNS; c++){
                    const cw = Column.getWidth(c);

                    if (currentX + cw >= this.scrollX && currentX <= this.scrollX + viewW) {
                        const x = Math.floor(currentX - this.scrollX);
                        const y = Math.floor(currentY - this.scrollY);

                        if (this.selection.boundedRange && this.selection.boundedRange.contains(r,c)){
                            ctx.fillStyle = 'rgba(33, 115, 70, 0.08)';
                            ctx.fillRect(x, y, cw, rh);
                        }

                        ctx.strokeStyle = '#e2e8f0';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(x, y, cw, rh);

                        const cell = this.pointerCell.bindTo(r,c);
                        if (cell.value){
                            let value = checkFormula(cell.value)
                            ctx.fillStyle = '#1e293b';
                            ctx.font = '13px Segoe UI, -apple-system, BlinkMacSystemFont, sans-serif';
                            ctx.textBaseline = 'middle';

                            ctx.save();
                            ctx.beginPath();
                            ctx.rect(x + 4, y, cw - 8, rh);
                            ctx.clip(); 

                            ctx.fillText(value || cell.value, x + 6, y + rh / 2);
                            ctx.restore();
                        }
                    }
                    currentX += cw;
                }
            }
            currentY += rh;
        }
    }
}
