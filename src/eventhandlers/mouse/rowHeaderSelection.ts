import { CellRange } from "../../cell.js";
import { HEADER_HEIGHT, HEADER_WIDTH, MAX_COLUMNS, MAX_ROWS, RESIZE_THRESHOLD } from "../../config/constants.js";
import { Row } from "../../utils/rowcolumn.js";
import type { GridState } from "../gridState.js";
import type { MouseHandler } from "./mouseController.js";

export class RowHeaderSelection implements MouseHandler {
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

        if (absoluteX > HEADER_WIDTH) return false;

        let currentY = 0 + HEADER_HEIGHT;
        for (let r = 0; r < MAX_ROWS; r++) {
            const rowH = Row.getHeight(r);
            if (
                (absoluteY - currentY + threshold) <= rowH 
                && (absoluteY - currentY)>threshold
                && absoluteX < HEADER_WIDTH
            ){                
                this.indexR = r;
                this.cellRange = new CellRange(this.indexR, this.indexC, this.indexR, MAX_COLUMNS);
                return true;
            }
            currentY += rowH;
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
        this.setCurrentRow(mouseX,mouseY);
        this.state.grid.selection.updateDragRange(this.indexR,this.indexC);
    }

    public pointerUp(mouseX: number, mouseY: number): void {
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

    private setCurrentRow(mouseX: number, mouseY: number): void {
        const absoluteY = mouseY + this.state.grid.scrollY;
        
        let currentY = 0 + HEADER_HEIGHT;
        for (let r = 0; r < MAX_ROWS; r++) {
            const rh = Row.getHeight(r);
            if (absoluteY >= currentY && absoluteY <= currentY + rh) {
                this.indexR = r
                break;
            }
            currentY += rh;
        }
    }


}