import { CellRange } from "../../cell.js";
import { HEADER_HEIGHT, HEADER_WIDTH, MAX_COLUMNS, MAX_ROWS, RESIZE_THRESHOLD } from "../../config/constants.js";
import { Column } from "../../utils/rowcolumn.js";
import type { GridState } from "../gridState.js";
import type { MouseHandler } from "./mouseController.js";

export class ColumnHeaderSelection implements MouseHandler {
    private indexC: number = 0;
    private indexR: number = 0;
    private cellRange: CellRange | null = null;

    constructor(private state: GridState){}

    public hitTest(mouseX: number, mouseY: number): boolean {
        const absoluteX = mouseX + this.state.grid.scrollX;
        const absoluteY = mouseY + this.state.grid.scrollY;
        const threshold = RESIZE_THRESHOLD;
        this.indexC = 0;
        this.indexR = 0;
        
        if (absoluteY > HEADER_HEIGHT) return false;
        let currentX = 0 + HEADER_WIDTH;
        for (let c = 0; c < MAX_COLUMNS; c++) {
            if (
                (absoluteX - currentX + threshold) <= Column.getWidth(c) 
                && (absoluteX-currentX)>threshold
                && absoluteY <= HEADER_HEIGHT
            ){
                this.indexC = c;
                this.cellRange = new CellRange(this.indexR, this.indexC, MAX_ROWS, this.indexC);
                return true;
            }
            currentX += Column.getWidth(c);
        }
        return false;
    }

    public pointerChange(): void {
    }

    public pointerDown(mouseX:number, mouseY:number): void {
        this.state.grid.selection.boundedRange = this.cellRange;
        this.state.grid.selection.activeColumn = this.cellRange!.endCol;
        this.state.grid.selection.activeRow = this.cellRange!.endRow;
        this.setSelectionEvaluation();
    }

    public pointerMove(mouseX: number, mouseY: number): void {
        this.setCurrentCol(mouseX, mouseY);
        this.state.grid.selection.updateDragRange(this.indexR,this.indexC);
        this.setSelectionEvaluation();
    }

    public pointerUp(mouseX: number, mouseY: number): void {
    }



    private setSelectionEvaluation(): void {
        if (!this.state.grid.selection.boundedRange) return;
        const evaluation = this.state.grid.selection.evaluate();
        document.getElementById("field-count")!.textContent = evaluation.count!;
        document.getElementById("field-min")!.textContent = evaluation.min!;
        document.getElementById("field-max")!.textContent = evaluation.max!;
        document.getElementById("field-average")!.textContent = evaluation.average!;
        document.getElementById("field-sum")!.textContent = evaluation.sum!;
    }


    private setCurrentCol(mouseX: number, mouseY: number): void {
        const absoluteX = mouseX + this.state.grid.scrollX;
        
        let currentX = 0 + HEADER_WIDTH;
        for (let c = 0; c < MAX_COLUMNS; c++) {
            const cw = Column.getWidth(c)
            if (
                absoluteX >= currentX 
                && absoluteX <= currentX + cw
            ){
                this.indexC = c;
            }
            currentX += cw;
        }
    }

}