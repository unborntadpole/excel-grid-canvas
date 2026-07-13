import { MAX_ROWS, MAX_COLUMNS, HEADER_WIDTH, HEADER_HEIGHT } from "./script.js";
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
        const cmd = new RenderJsonCommand(`${this.selection.activeRow},${this.selection.activeColumn}`);
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

        let setInitialRow = true;
        let setInitialCol = true;
        let setLastRow = true;
        let setLastCol = true;

        let currentY = HEADER_HEIGHT;
        let r = 0;
        for (r = 0; r < MAX_ROWS; r++) {
            const rh = Row.getHeight(r);
            
            if (currentY + rh >= this.scrollY && currentY <= this.scrollY + viewH) {
                if (setInitialRow) {
                    this.firstRow = r;
                    setInitialRow = false;
                }

                let currentXLoop = HEADER_WIDTH;
                let c = 0
                for (c = 0; c < MAX_COLUMNS; c++) {
                    const cw = Column.getWidth(c);

                    if (currentXLoop + cw >= this.scrollX && currentXLoop <= this.scrollX + viewW) {
                        if (setInitialCol) {
                            this.firstCol = c;
                            setInitialCol = false;
                        }
                        const x = Math.floor(currentXLoop - this.scrollX);
                        const y = Math.floor(currentY - this.scrollY);

                        if (this.selection.boundedRange && this.selection.boundedRange.contains(r, c)) {
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
                            ctx.rect(x + 4, y, cw - 4, rh);
                            ctx.clip(); 

                            ctx.fillText(value || cell.value, x + cw/2, y + rh / 2);
                            ctx.restore();
                        }
                        
                    } else if (!setInitialCol && setLastCol){
                        this.lastCol = c;
                        setLastCol = false;
                    }
                    currentXLoop += cw;
                }
                                const rowX = 0;
                const rowY = Math.floor(currentY - this.scrollY);
                
                ctx.fillStyle = '#f8fafc';
                ctx.fillRect(rowX, rowY, HEADER_WIDTH, rh);
                ctx.strokeStyle = '#e2e8f0';
                ctx.strokeRect(rowX, rowY, HEADER_WIDTH, rh);

                ctx.fillStyle = '#475569';
                ctx.font = 'bold 12px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText((r + 1).toString(), rowX + HEADER_WIDTH / 2, rowY + rh / 2);

            } else if (!setInitialRow && setLastRow){
                this.lastRow = r;
                setLastRow = false;
            }
            currentY += rh;
        }
        let currentX = HEADER_WIDTH;
        for (let c = 0; c < MAX_COLUMNS; c++) {
            const cw = Column.getWidth(c);
            if (currentX + cw >= this.scrollX && currentX <= this.scrollX + viewW) {


                const x = Math.floor(currentX - this.scrollX);
                const y = 0;

                ctx.fillStyle = '#f8fafc';
                ctx.fillRect(x, y, cw, HEADER_HEIGHT);
                ctx.strokeStyle = '#e2e8f0';
                ctx.strokeRect(x, y, cw, HEADER_HEIGHT);

                const label = colIndexToAlphabet(c); 
                ctx.fillStyle = '#475569';
                ctx.font = 'bold 12px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(label, x + cw / 2, y + HEADER_HEIGHT / 2);
            }
            currentX += cw;
        }
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, HEADER_WIDTH, HEADER_HEIGHT);
        ctx.strokeStyle = '#e2e8f0';
        ctx.strokeRect(0, 0, HEADER_WIDTH, HEADER_HEIGHT);
    }

}

function colIndexToAlphabet(index: number): string {
  let result = '';
  
  while (index >= 0) {
    const remainder = index % 26;
    result = String.fromCharCode(65 + remainder) + result;
    index = Math.floor(index / 26) - 1;
  }
  
  return result;
}