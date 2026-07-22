import { DEFAULT_COLUMN_WIDTH, DEFAULT_ROW_HEIGHT, HEADER_HEIGHT, HEADER_WIDTH } from "../../config/constants.js";
import { Column, Row } from "../../utils/rowcolumn.js";
import type { GridState } from "../gridState.js";

export class EditCell{
    private currentEditingCell : {row: number, col: number} | null = null;
    constructor(private gridState: GridState){}

    private getCellPosition(row: number, column: number): { x: number; y: number; w: number; h: number } {
        let X = this.gridState.grid.scrollX;
        let Y = this.gridState.grid.scrollY;

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

    public getCurrentEditingCell() {
        return this.currentEditingCell;
    }

    public startEditing(cell: {row:number, col:number}): void {
        this.currentEditingCell = cell;
        const cellTarget = this.getCellPosition(cell.row, cell.col);
        const currentText = this.gridState.grid.pointerCell.bindTo(cell.row, cell.col).value;

        this.gridState.editor.value = currentText;
        this.gridState.editor.style.left = `${cellTarget.x - this.gridState.container.scrollLeft}px`;
        this.gridState.editor.style.top = `${cellTarget.y - this.gridState.container.scrollTop}px`;
        this.gridState.editor.style.width = `${cellTarget.w}px`;
        this.gridState.editor.style.height = `${cellTarget.h}px`;
        this.gridState.editor.style.display = 'block';
        
        setTimeout(() => this.gridState.editor.focus(), 10);
    }

    public commitEditingChanges(): void {
        if (!this.currentEditingCell) return;
        this.gridState.grid.typeIntoCell(
            this.currentEditingCell.row, 
            this.currentEditingCell.col, 
            this.gridState.editor.value
        );
        this.currentEditingCell = null;
        this.gridState.editor.style.display = 'none';
    }

    public cancelEditing(): void {
        this.gridState.editor.style.display = 'none';
        this.currentEditingCell = null;
    }

}