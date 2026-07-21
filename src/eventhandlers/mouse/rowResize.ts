import { DEFAULT_ROW_HEIGHT, HEADER_HEIGHT, HEADER_WIDTH, MAX_ROWS, MIN_ROW_HEIGHT, RESIZE_THRESHOLD } from "../../config/constants.js";
import type { Grid } from "../../grid.js";
import { Row } from "../../utils/rowcolumn.js";
import type { MouseHandler } from "./mouseController.js";
import type { GridState } from "../gridState.js";

export class ResizeRow implements MouseHandler{
    private index: number = -1;
    private gridState: GridState;
    private grid: Grid;
    private initialMousePos: number = -1;
    private initialSize: number = DEFAULT_ROW_HEIGHT;

    constructor(gridState: GridState){
        this.gridState = gridState;
        this.grid = this.gridState.grid;
    }

    public hitTest(mouseX:number, mouseY:number): boolean {
        const res = this.checkResizeRow(mouseX, mouseY);
        this.index = res.index;
        this.initialMousePos = mouseY;
        return res.result;
    }
    public pointerChange(): void {
        this.gridState.canvas.style.cursor = 'row-resize';
    }
    public pointerDown(mouseX:number, mouseY:number): void {
        this.initialSize = Row.getHeight(this.index);
    }
    public pointerMove(mouseX:number, mouseY:number): void {
        const delta = mouseY - this.initialMousePos;
        const newHeight = Math.max(MIN_ROW_HEIGHT, this.initialSize + delta);
        Row.setHeight(this.index, newHeight);
        this.updateScrollDimensions();
    }
    public pointerUp(mouseX: number, mouseY: number): void {
        const delta = mouseY - this.initialMousePos;
        Row.setHeight(this.index, this.initialSize);
        this.grid.resizeRow(this.index, Math.max(MIN_ROW_HEIGHT, this.initialSize + delta));
        this.updateScrollDimensions();
        this.index = -1;
        this.gridState.canvas.style.cursor = 'default';
    }

    private checkResizeRow(pixelX: number, pixelY: number): {result: boolean, index: number} {
        const absoluteY = pixelY + this.grid.scrollY;
        const threshold = RESIZE_THRESHOLD;
        if (pixelX > HEADER_WIDTH ) return { result: false, index: -1 }
        let currentY = 0 + HEADER_HEIGHT;
        for (let r = 0; r < MAX_ROWS; r++) {
            currentY += Row.getHeight(r);
            if (Math.abs(absoluteY - currentY) <= threshold) return { result: true, index: r };
        }
        return {result: false, index: -1};
    }

    private updateScrollDimensions = (): void => {
        
        let totalHeight = 0;
        for (let r = 0; r < MAX_ROWS; r++) totalHeight += Row.getHeight(r);

        this.gridState.spacer.style.height = `${totalHeight + HEADER_HEIGHT}px`;
    };

}