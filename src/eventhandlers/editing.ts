import { DEFAULT_COLUMN_WIDTH, DEFAULT_ROW_HEIGHT, HEADER_HEIGHT, HEADER_WIDTH, MAX_COLUMNS, MAX_ROWS, RESIZE_THRESHOLD } from "../config/constants.js";
import type { Grid } from "../grid.js";
import { Column, Row } from "../utils/rowcolumn.js";
import type { GridState } from "./gridState.js";

export class Editing {
    private grid: Grid;
    private gridState : GridState;

    constructor(state: GridState){
        this.gridState = state;
        this.grid = this.gridState.grid;
        this.initialize();
    }

    public initialize() {
        this.gridState.canvas.addEventListener('pointerdown', this.handleMouseDown);
        this.gridState.canvas.addEventListener('dblclick', this.handleDblClick);
        window.addEventListener('keydown', this.handleKeyDown);
        this.gridState.editor.addEventListener('keydown', this.handleEditorKeyDown);
        this.gridState.editor.addEventListener('blur', this.handleEditorBlur);
    }

    public destroyListeners() {
        this.gridState.canvas.removeEventListener('pointerdown', this.handleMouseDown);
        this.gridState.canvas.removeEventListener('dblclick', this.handleDblClick);
        window.removeEventListener('keydown', this.handleKeyDown);
        this.gridState.editor.removeEventListener('keydown', this.handleEditorKeyDown);
        this.gridState.editor.removeEventListener('blur', this.handleEditorBlur);
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

    private getCellPosition(row: number, column: number): { x: number; y: number; w: number; h: number } {
        let X = this.grid.scrollX;
        let Y = this.grid.scrollY;

        X += HEADER_WIDTH;
        let w = DEFAULT_COLUMN_WIDTH;
        for (let c = 0; c < column; c++) {
            w = Column.getWidth(c);
            X += w;
        }
        w = Column.getWidth(column+1);

        Y = HEADER_HEIGHT;
        let h = DEFAULT_ROW_HEIGHT;
        for (let r = 0; r < row; r++) {
            h = Row.getHeight(r);
            Y += h;
        }
        h = Row.getHeight(row+1);

        return { x: X, y: Y, w: w, h: h };
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

    private startEditing(): void {
        if (!this.gridState.currentSelectedCell) return;
        this.gridState.currentEditingCell = {row:this.gridState.currentSelectedCell.row, col:this.gridState.currentSelectedCell.col};

        const cellTarget = this.getCellPosition(this.gridState.currentSelectedCell.row, this.gridState.currentSelectedCell.col);
        const currentText = this.grid.pointerCell.bindTo(this.gridState.currentEditingCell.row, this.gridState.currentEditingCell.col).value;

        this.gridState.editor.value = currentText;
        this.gridState.editor.style.left = `${cellTarget.x - this.gridState.container.scrollLeft}px`;
        this.gridState.editor.style.top = `${cellTarget.y - this.gridState.container.scrollTop}px`;
        this.gridState.editor.style.width = `${cellTarget.w}px`;
        this.gridState.editor.style.height = `${cellTarget.h}px`;
        this.gridState.editor.style.display = 'block';
        setTimeout(() => this.gridState.editor.focus(), 10);
    }
    

    private handleMouseDown = (e: MouseEvent): void => {
        e.preventDefault(); 
        this.gridState.canvas.focus();
        const rect = this.gridState.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const cellTarget = this.getCellAtPixels(mouseX, mouseY);
        this.gridState.currentSelectedCell = { row: cellTarget.row, col: cellTarget.col };

        const resizeHit = this.checkResizeTarget(mouseX, mouseY);
        if (resizeHit.type === null) {
            if (this.gridState.currentEditingCell) this.commitEditingChanges();
            this.grid.render();
        }
    };

    private handleDblClick = (e: MouseEvent): void => {
        this.startEditing();
    };
    
    private commitEditingChanges(): void {
        if (!this.gridState.currentEditingCell) return;
        this.grid.typeIntoCell(
            this.gridState.currentEditingCell.row, 
            this.gridState.currentEditingCell.col, 
            this.gridState.editor.value
        );
        this.gridState.editor.style.display = 'none';
        this.gridState.currentEditingCell = null;
    }

    private handleKeyDown = (e: KeyboardEvent): void => {
        if (!this.gridState.currentEditingCell && e.key === 'Enter'){
            this.startEditing();
        }
    }

    private handleEditorKeyDown = (e: KeyboardEvent): void => {
         if (e.key === 'Enter') {
            this.commitEditingChanges();
            this.gridState.canvas.focus();
        } 
        else if (e.key === 'Escape') {
            this.gridState.editor.style.display = 'none';
            this.gridState.currentEditingCell = null;
            this.gridState.canvas.focus();
        }
    };
    private handleEditorBlur = (): void => {
        this.commitEditingChanges();
    };

}