import { DEFAULT_COLUMN_WIDTH, HEADER_HEIGHT, HEADER_WIDTH, MAX_COLUMNS, MIN_COL_WIDTH, RESIZE_THRESHOLD } from "../../config/constants.js";
import type { Grid } from "../../grid.js";
import { Column } from "../../utils/rowcolumn.js";
import type { MouseHandler } from "./mouseController.js";
import type { GridState } from "../gridState.js";

export class ResizeCol implements MouseHandler{
    private index: number = -1;
    private gridState: GridState;
    private grid: Grid;
    private initialMousePos: number = -1;
    private initialSize: number = DEFAULT_COLUMN_WIDTH;

    constructor(gridState: GridState){
        this.gridState = gridState;
        this.grid = this.gridState.grid;
    }

    public hitTest(mouseX:number, mouseY:number): boolean {
        const res = this.checkResizeCol(mouseX, mouseY);
        this.index = res.index;
        this.initialMousePos = mouseX;
        return res.result;
    }
    public pointerChange(): void {
        this.gridState.canvas.style.cursor = 'col-resize';
    }
    public pointerDown(mouseX:number, mouseY:number): void {
        this.initialSize = Column.getWidth(this.index);
    }
    public pointerMove(mouseX:number, mouseY:number): void {
        const delta = mouseX - this.initialMousePos;
        const newWidth = Math.max(MIN_COL_WIDTH, this.initialSize + delta);
        Column.setWidth(this.index, newWidth);
        this.updateScrollDimensions();
    }
    public pointerUp(mouseX: number, mouseY: number): void {
        const delta = mouseX - this.initialMousePos;
        Column.setWidth(this.index, this.initialSize);
        this.grid.resizeColumn(this.index, Math.max(MIN_COL_WIDTH, this.initialSize + delta));
        this.updateScrollDimensions();
        this.index = -1;
        this.gridState.canvas.style.cursor = 'default';
    }

    private updateScrollDimensions = (): void => {
        let totalWidth = 0;
        for (let c = 0; c < MAX_COLUMNS; c++) totalWidth += Column.getWidth(c);
        this.gridState.spacer.style.width = `${totalWidth + HEADER_WIDTH}px`;
    };

    private checkResizeCol(pixelX: number, pixelY: number): {result: boolean, index: number} {
        const absoluteX = pixelX + this.grid.scrollX;
        const threshold = RESIZE_THRESHOLD;
        if (pixelY > HEADER_HEIGHT) return { result: false, index: -1 }
        let currentX = 0 + HEADER_WIDTH;
        for (let c = 0; c < MAX_COLUMNS; c++) {
            currentX += Column.getWidth(c);
            if (Math.abs(absoluteX - currentX) <= threshold) return { result: true, index: c };
        }
        return {result: false, index: -1};
    }
}