import { Cell, Selection } from "./cell.js";
import { HEADER_HEIGHT, HEADER_WIDTH, MAX_COLUMNS, MAX_ROWS } from "./config/constants.js";
import { checkFormula } from "./utils/formulae.js";
import { Column, Row } from "./utils/rowcolumn.js";

export class GridRenderer {
    private readonly ctx: CanvasRenderingContext2D;
    private readonly selection: Selection;
    private readonly pointerCell: Cell = new Cell;
    private boundedRangeLimits: Record<string,number> | null = null;
    private scrollX = 0;
    private scrollY = 0;
    private lastRow = 0;
    private lastCol = 0;
    private firstRow = 0;
    private firstCol = 0;

    constructor(ctx:CanvasRenderingContext2D, selection:Selection, private canvas: HTMLCanvasElement){
        this.ctx = ctx;
        this.selection = selection;
    }

    public set setScrollX(x: number){
        this.scrollX = x;
    }
    public set setScrollY(y: number){
        this.scrollY = y;
    }
    public get setScrollX(){
        return this.scrollX;
    }
    public get setScrollY(){
        return this.scrollY;
    }
    
    private resetRangeLimits(): void {
        this.boundedRangeLimits = null;
    }

    private addToRangeLimits (x:number,y:number,cw:number,rh:number):void {
        if (!this.boundedRangeLimits) this.boundedRangeLimits = {x:x, y:y, initX: x, initY: y, cw:cw, rh:rh};
        if (x > this.boundedRangeLimits.x!) {
            this.boundedRangeLimits.cw! += cw;
            this.boundedRangeLimits.x = x;
        }
        if (y > this.boundedRangeLimits.y!) {
            this.boundedRangeLimits.rh! += rh;
            this,this.boundedRangeLimits.y = y;
        }
    }

    private colIndexToAlphabet(index: number): string {
        let result = '';
        
        while (index >= 0) {
            const remainder = index % 26;
            result = String.fromCharCode(65 + remainder) + result;
            index = Math.floor(index / 26) - 1;
        }
        
        return result;
    }

    public get gridFirstLastCells(): Record<string,number>{
        return {
            'fr': this.firstRow,
            'lr': this.lastRow,
            'fc': this.firstCol,
            'lc': this.lastCol
        }
    }

    public render(): void {
        const ctx = this.ctx;
        const dpr = window.devicePixelRatio || 1;
        const viewW = this.canvas.width / dpr;
        const viewH = this.canvas.height / dpr;

        this.resetRangeLimits();

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
                            this.addToRangeLimits(x,y,cw,rh);
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

                const label = this.colIndexToAlphabet(c); 
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
        if (this.selection.boundedRange && this.boundedRangeLimits){
            ctx.fillStyle = 'rgba(33, 115, 70, 0.08)';
            const x = this.boundedRangeLimits!.initX!;
            const y = this.boundedRangeLimits!.initY!;
            const w = this.boundedRangeLimits!.cw!;
            const h = this.boundedRangeLimits!.rh!;
            ctx.fillRect(x, 0, w, HEADER_HEIGHT);
            ctx.fillRect(0, y, HEADER_WIDTH, h);

        }
    }

}