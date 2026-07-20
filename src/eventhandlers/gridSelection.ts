import { CellRange } from "../cell.js";
import { HEADER_HEIGHT, HEADER_WIDTH, MAX_COLUMNS, MAX_ROWS, RESIZE_THRESHOLD } from "../config/constants.js";
import type { Grid } from "../grid.js";
import { Column, Row } from "../utils/rowcolumn.js";
import type { Handler } from "./eventhandler.js";
import type { GridState } from "./gridState.js";

export class GridSelection implements Handler{
    private grid: Grid;
    private gridState : GridState;

    constructor(state: GridState){
        this.gridState = state;
        this.grid = this.gridState.grid;
    }

    public initialize() {
        this.gridState.canvas.addEventListener('pointerdown', this.handleMouseDown);
        window.addEventListener('pointermove', this.handleMouseMove);
        window.addEventListener('pointerup', this.handleMouseUp);
    }

    public destroyListeners() {
        this.gridState.canvas.removeEventListener('pointerdown', this.handleMouseDown);
        window.removeEventListener('pointermove', this.handleMouseMove);
        window.removeEventListener('pointerup', this.handleMouseUp);
    }
    
    private getCellAtPixels(pixelX: number, pixelY: number): { row: number; col: number; x: number; y: number; w: number; h: number } {
        const absoluteX = pixelX + this.grid.scrollX;
        const absoluteY = pixelY + this.grid.scrollY;

        let currentX = 0 + HEADER_WIDTH, col = 0, cellX = 0, cellW = 0;
        for (let c = 0; c < MAX_COLUMNS; c++) {
            const cw = Column.getWidth(c);
            if (absoluteX >= currentX && absoluteX <= currentX + cw) {
                col = c; 
                cellX = currentX - this.grid.scrollX; 
                cellW = cw;
                break;
            }
            currentX += cw;
        }

        let currentY = 0 + HEADER_HEIGHT, row = 0, cellY = 0, cellH = 0;
        for (let r = 0; r < MAX_ROWS; r++) {
            const rh = Row.getHeight(r);
            if (absoluteY >= currentY && absoluteY <= currentY + rh) {
                row = r; cellY = currentY - this.grid.scrollY; cellH = rh;
                break;
            }
            currentY += rh;
        }

        return { row, col, x: cellX, y: cellY, w: cellW, h: cellH };
    }

    private checkResizeTarget(pixelX: number, pixelY: number): { type: 'col' | 'row' | null; index: number } {
        const absoluteX = pixelX + this.grid.scrollX;
        const absoluteY = pixelY + this.grid.scrollY;
        const threshold = RESIZE_THRESHOLD;

        let currentX = 0 + HEADER_WIDTH;
        for (let c = 0; c < MAX_COLUMNS; c++) {
            currentX += Column.getWidth(c);
            if (Math.abs(absoluteX - currentX) <= threshold) return { type: 'col', index: c };
        }

        let currentY = 0 + HEADER_HEIGHT;
        for (let r = 0; r < MAX_ROWS; r++) {
            currentY += Row.getHeight(r);
            if (Math.abs(absoluteY - currentY) <= threshold) return { type: 'row', index: r };
        }

        return { type: null, index: -1 };
    }

    private checkIfHeader(pixelX: number, pixelY: number):{ type: 'col' | 'row' | null; index: number }{
        const absoluteX = pixelX + this.grid.scrollX;
        const absoluteY = pixelY + this.grid.scrollY;
        const threshold = RESIZE_THRESHOLD;

        let currentX = 0 + HEADER_WIDTH;
        for (let c = 0; c < MAX_COLUMNS; c++) {
            if (
                (absoluteX - currentX + threshold) <= Column.getWidth(c) 
                && (absoluteX-currentX)>threshold
                && absoluteY <= HEADER_HEIGHT
            ){
                return { type: 'col', index: c };
            }
            currentX += Column.getWidth(c);
        }

        let currentY = 0 + HEADER_HEIGHT;
        for (let r = 0; r < MAX_ROWS; r++) {
            const rowH = Row.getHeight(r);
            if (
                (absoluteY - currentY + threshold) <= rowH 
                && (absoluteY - currentY)>threshold
                && absoluteX < HEADER_WIDTH
            ){
                return { type: 'row', index: r };
            }
            currentY += rowH;
        }

        return { type: null, index: -1 };
    }

    private setSelectionEvaluation(): void {
        if (
            this.gridState.selectedRange !== null 
            && this.grid.selection.boundedRange 
            && this.grid.selection.boundedRange.isSame(this.gridState.selectedRange)
        ) return;
        this.gridState.selectedRange = this.grid.selection.boundedRange;
        const evaluation = this.grid.selection.evaluate();
        document.getElementById("field-count")!.textContent = evaluation.count!;
        document.getElementById("field-min")!.textContent = evaluation.min!;
        document.getElementById("field-max")!.textContent = evaluation.max!;
        document.getElementById("field-average")!.textContent = evaluation.average!;
        document.getElementById("field-sum")!.textContent = evaluation.sum!;
    }



    private handleMouseDown = (e: MouseEvent): void => {
        e.preventDefault(); 
        this.gridState.canvas.focus();
        
        const rect = this.gridState.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const cellTarget = this.getCellAtPixels(mouseX, mouseY);
        this.gridState.currentSelectedCell = { row: cellTarget.row, col: cellTarget.col };

        const headerHit = this.checkIfHeader(mouseX, mouseY);
        if (headerHit.type === 'col') {
            this.grid.selection.boundedRange = new CellRange(0, headerHit.index, MAX_ROWS, headerHit.index);
            this.setSelectionEvaluation();
            this.grid.render();
            return;
        } else if (headerHit.type === 'row') {
            this.grid.selection.boundedRange = new CellRange(headerHit.index, 0, headerHit.index, MAX_COLUMNS);
            this.setSelectionEvaluation();
            this.grid.render();
            return;
        }

        const resizeHit = this.checkResizeTarget(mouseX, mouseY);
        if (resizeHit.type === null) {
            this.gridState.isDraggingSelection = true;
            const target = this.getCellAtPixels(mouseX, mouseY);
            this.grid.selection.selectCell(target.row, target.col);
            this.setSelectionEvaluation();
            this.grid.render();
        }
    };

    private handleMouseMove = (e: MouseEvent): void => {
        const rect = this.gridState.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (this.gridState.isDraggingSelection) {
            const target = this.getCellAtPixels(mouseX, mouseY);
            this.grid.selection.updateDragRange(target.row, target.col);
            this.setSelectionEvaluation();
            this.grid.render();
            return;
        }
    };

    private handleMouseUp = (e: MouseEvent): void => {
        if (this.gridState.isDraggingSelection) {
            this.setSelectionEvaluation();
        }
        this.gridState.isDraggingSelection = false;
    };

}