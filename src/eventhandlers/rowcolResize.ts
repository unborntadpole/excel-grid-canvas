import { HEADER_HEIGHT, HEADER_WIDTH, MAX_COLUMNS, MAX_ROWS, RESIZE_THRESHOLD } from "../config/constants.js";
import type { Grid } from "../grid.js";
import { Column, Row } from "../utils/rowcolumn.js";
import type { GridState } from "./gridState.js";

export class ResizeRowCol {
    private grid: Grid;
    private gridState : GridState;

    constructor(state: GridState){
        this.gridState = state;
        this.grid = this.gridState.grid;
        this.initialize();
    }

    private initialize() {
        this.gridState.canvas.addEventListener('pointerdown', this.handleMouseDown);
        window.addEventListener('pointermove', this.handleMouseMove);
        window.addEventListener('pointerup', this.handleMouseUp);
        this.updateScrollDimensions();
    }

    public destroyListeners() {
        this.gridState.canvas.removeEventListener('pointerdown', this.handleMouseDown);
        window.removeEventListener('pointermove', this.handleMouseMove);
        window.removeEventListener('pointerup', this.handleMouseUp);
    }

    private checkResizeTarget(pixelX: number, pixelY: number): { type: 'col' | 'row' | null; index: number } {
        const absoluteX = pixelX + this.grid.scrollX;
        const absoluteY = pixelY + this.grid.scrollY;
        const threshold = RESIZE_THRESHOLD;
        if (pixelX > HEADER_WIDTH && pixelY > HEADER_HEIGHT) return { type: null, index: -1 }
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

    private updateScrollDimensions = (): void => {
        let totalWidth = 0;
        for (let c = 0; c < MAX_COLUMNS; c++) totalWidth += Column.getWidth(c);
        
        let totalHeight = 0;
        for (let r = 0; r < MAX_ROWS; r++) totalHeight += Row.getHeight(r);

        this.gridState.spacer.style.width = `${totalWidth + HEADER_WIDTH}px`;
        this.gridState.spacer.style.height = `${totalHeight + HEADER_HEIGHT}px`;
    };

    
    private handleMouseDown = (e: MouseEvent): void => {
        e.preventDefault(); 
        this.gridState.canvas.focus();
        
        const rect = this.gridState.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const resizeHit = this.checkResizeTarget(mouseX, mouseY);
        if (resizeHit.type === 'col') {
            this.gridState.isResizingColumn = true;
            this.gridState.activeResizeIndex = resizeHit.index;
            this.gridState.initialMousePos = e.clientX;
            this.gridState.initialSize = Column.getWidth(this.gridState.activeResizeIndex);
        } else if (resizeHit.type === 'row') {
            this.gridState.isResizingRow = true;
            this.gridState.activeResizeIndex = resizeHit.index;
            this.gridState.initialMousePos = e.clientY;
            this.gridState.initialSize = Row.getHeight(this.gridState.activeResizeIndex);
        }
    };

    private handleMouseMove = (e: MouseEvent): void => {
        const rect = this.gridState.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (this.gridState.isResizingColumn) {
            const delta = e.clientX - this.gridState.initialMousePos;
            const newWidth = Math.max(30, this.gridState.initialSize + delta); 
            Column.setWidth(this.gridState.activeResizeIndex, newWidth);
            this.updateScrollDimensions();
            this.grid.render();
            return;
        }

        if (this.gridState.isResizingRow) {
            const delta = e.clientY - this.gridState.initialMousePos;
            const newHeight = Math.max(18, this.gridState.initialSize + delta);
            Row.setHeight(this.gridState.activeResizeIndex, newHeight);
            this.updateScrollDimensions();
            this.grid.render();
            return;
        }

        const hit = this.checkResizeTarget(mouseX, mouseY);
        if (hit.type === 'col') this.gridState.canvas.style.cursor = 'col-resize';
        else if (hit.type === 'row') this.gridState.canvas.style.cursor = 'row-resize';
        else this.gridState.canvas.style.cursor = 'cell';
    };

    private handleMouseUp = (e: MouseEvent): void => {
        if (this.gridState.isResizingColumn) {
            const delta = e.clientX - this.gridState.initialMousePos;
            Column.setWidth(this.gridState.activeResizeIndex, this.gridState.initialSize);
            this.grid.resizeColumn(this.gridState.activeResizeIndex, Math.max(30, this.gridState.initialSize + delta));
        } else if (this.gridState.isResizingRow) {
            const delta = e.clientY - this.gridState.initialMousePos;
            Row.setHeight(this.gridState.activeResizeIndex, this.gridState.initialSize);
            this.grid.resizeRow(this.gridState.activeResizeIndex, Math.max(18, this.gridState.initialSize + delta));
        }
        
        this.gridState.isResizingColumn = false;
        this.gridState.isResizingRow = false;
        this.gridState.activeResizeIndex = -1;
    };
}