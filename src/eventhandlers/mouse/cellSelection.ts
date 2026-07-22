import { DOUBLECLICK_TIME, HEADER_HEIGHT, HEADER_WIDTH, MAX_COLUMNS, MAX_ROWS } from "../../config/constants.js";
import { Column, Row } from "../../utils/rowcolumn.js";
import type { GridState } from "../gridState.js";
import type { MouseHandler } from "./mouseController.js";

export class CellSelection implements MouseHandler {
    private selectedCell : {row:number, col:number} | null = null;
    constructor(private state : GridState) {}

    public hitTest(mouseX: number, mouseY: number): boolean {
        const absoluteX = mouseX + this.state.grid.scrollX;
        const absoluteY = mouseY + this.state.grid.scrollY;
        this.selectedCell = null;
        if (absoluteX > HEADER_WIDTH && absoluteY > HEADER_HEIGHT){
            const cell = this.getCellAtPos(mouseX, mouseY);
            this.selectedCell = {'row': cell.row, 'col': cell.col};
            return true;
        }
        return false;
    }

    public pointerChange(): void {}

    public pointerDown(mouseX:number, mouseY:number): void {
        if(this.selectedCell){
            const diff = performance.now() - this.state.lastClick;
            if (diff < DOUBLECLICK_TIME) {
                this.state.lastClick = 0;
                this.state.editing.startEditing(this.selectedCell);
                return;
            }
            this.state.grid.selection.selectCell(
                this.selectedCell.row,
                this.selectedCell.col
            );
            if(this.state.editing.getCurrentEditingCell()){
                this.state.editing.commitEditingChanges();
            }
            this.setSelectionEvaluation();
        }
        this.state.timeClick();
    }

    public pointerMove(mouseX: number, mouseY: number): void {
        const target = this.getCellAtPos(mouseX, mouseY);
        this.state.grid.selection.updateDragRange(target.row, target.col);
        this.setSelectionEvaluation();
    }

    public pointerUp(mouseX: number, mouseY: number): void {}

        
    private getCellAtPos(pixelX: number, pixelY: number): { row: number; col: number } {
        const absoluteX = pixelX + this.state.grid.scrollX;
        const absoluteY = pixelY + this.state.grid.scrollY;
        let currentX = 0 + HEADER_WIDTH, col = 0;
        for (let c = 0; c < MAX_COLUMNS; c++) {
            const cw = Column.getWidth(c);
            if (absoluteX >= currentX && absoluteX <= currentX + cw) {
                col = c; 
                break;
            }
            currentX += cw;
        }

        let currentY = 0 + HEADER_HEIGHT, row = 0;
        for (let r = 0; r < MAX_ROWS; r++) {
            const rh = Row.getHeight(r);
            if (absoluteY >= currentY && absoluteY <= currentY + rh) {
                row = r;
                break;
            }
            currentY += rh;
        }

        return { row, col};
    }

    private setSelectionEvaluation(): void {
        if (this.state.grid.selection.boundedRange) return;
        const evaluation = this.state.grid.selection.evaluate();
        document.getElementById("field-count")!.textContent = evaluation.count!;
        document.getElementById("field-min")!.textContent = evaluation.min!;
        document.getElementById("field-max")!.textContent = evaluation.max!;
        document.getElementById("field-average")!.textContent = evaluation.average!;
        document.getElementById("field-sum")!.textContent = evaluation.sum!;
    }
}