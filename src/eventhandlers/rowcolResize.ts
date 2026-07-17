// import { HEADER_HEIGHT, HEADER_WIDTH, MAX_COLUMNS, MAX_ROWS, RESIZE_THRESHOLD } from "../config/constants.js";
// import type { Grid } from "../grid.js";
// import { Column, Row } from "../utils/rowcolumn.js";

// export class ResizeRowCol {
//     private canvas: HTMLCanvasElement;
//     private grid: Grid;
//     private isResizingColumn = false;
//     private isResizingRow = false;
//     private activeResizeIndex = 0;
//     private initialMousePos = 0;
//     private initialSize = 0;

//     constructor(canvas: HTMLCanvasElement, grid: Grid){
//         this.canvas = canvas;
//         this.grid = grid;
//     }

//     private checkResizeTarget(pixelX: number, pixelY: number): { type: 'col' | 'row' | null; index: number } {
//         const absoluteX = pixelX + this.grid.scrollX;
//         const absoluteY = pixelY + this.grid.scrollY;
//         const threshold = RESIZE_THRESHOLD;
//         // if (pixelX > HEADER_WIDTH || pixelY > HEADER_HEIGHT) return { type: null, index: -1 }
//         let currentX = 0 + HEADER_WIDTH;
//         for (let c = 0; c < MAX_COLUMNS; c++) {
//             currentX += Column.getWidth(c);
//             if (Math.abs(absoluteX - currentX) <= threshold) return { type: 'col', index: c };
//         }

//         let currentY = 0 + HEADER_HEIGHT;
//         for (let r = 0; r < MAX_ROWS; r++) {
//             currentY += Row.getHeight(r);
//             if (Math.abs(absoluteY - currentY) <= threshold) return { type: 'row', index: r };
//         }

//         return { type: null, index: -1 };
//     }

    
//     private handleMouseDown = (e: MouseEvent): void => {
//         e.preventDefault(); 
//         this.canvas.focus();
        
//         const rect = this.canvas.getBoundingClientRect();
//         const mouseX = e.clientX - rect.left;
//         const mouseY = e.clientY - rect.top;

//         const resizeHit = this.checkResizeTarget(mouseX, mouseY);
//         if (resizeHit.type === 'col') {
//             this.isResizingColumn = true;
//             this.activeResizeIndex = resizeHit.index;
//             this.initialMousePos = e.clientX;
//             this.initialSize = Column.getWidth(this.activeResizeIndex);
//         } else if (resizeHit.type === 'row') {
//             this.isResizingRow = true;
//             this.activeResizeIndex = resizeHit.index;
//             this.initialMousePos = e.clientY;
//             this.initialSize = Row.getHeight(this.activeResizeIndex);
//         } else {
//             this.isDraggingSelection = true;
//             if (this.currentEditingCell) this.commitEditingChanges();
//             const target = this.getCellAtPixels(mouseX, mouseY);
//             this.grid.selection.selectCell(target.row, target.col);
//             this.setSelectionEvaluation();
//             this.grid.render();
//         }
//     };

//     private handleMouseMove = (e: MouseEvent): void => {
//         const rect = this.canvas.getBoundingClientRect();
//         const mouseX = e.clientX - rect.left;
//         const mouseY = e.clientY - rect.top;

//         if (this.isResizingColumn) {
//             const delta = e.clientX - this.initialMousePos;
//             const newWidth = Math.max(30, this.initialSize + delta); 
//             Column.setWidth(this.activeResizeIndex, newWidth);
//             this.updateScrollDimensions();
//             this.grid.render();
//             return;
//         }

//         if (this.isResizingRow) {
//             const delta = e.clientY - this.initialMousePos;
//             const newHeight = Math.max(18, this.initialSize + delta);
//             Row.setHeight(this.activeResizeIndex, newHeight);
//             this.updateScrollDimensions();
//             this.grid.render();
//             return;
//         }

//         if (this.isDraggingSelection) {
//             const target = this.getCellAtPixels(mouseX, mouseY);
//             this.grid.selection.updateDragRange(target.row, target.col);
//             this.setSelectionEvaluation();
//             this.grid.render();
//             return;
//         }

//         const hit = this.checkResizeTarget(mouseX, mouseY);
//         if (hit.type === 'col') this.canvas.style.cursor = 'col-resize';
//         else if (hit.type === 'row') this.canvas.style.cursor = 'row-resize';
//         else this.canvas.style.cursor = 'cell';
//     };

//     private handleMouseUp = (e: MouseEvent): void => {
//         if (this.isResizingColumn) {
//             const delta = e.clientX - this.initialMousePos;
//             Column.setWidth(this.activeResizeIndex, this.initialSize);
//             this.grid.resizeColumn(this.activeResizeIndex, Math.max(30, this.initialSize + delta));
//         } else if (this.isResizingRow) {
//             const delta = e.clientY - this.initialMousePos;
//             Row.setHeight(this.activeResizeIndex, this.initialSize);
//             this.grid.resizeRow(this.activeResizeIndex, Math.max(18, this.initialSize + delta));
//         }

//         if (this.isDraggingSelection) {
//             this.setSelectionEvaluation();
//         }
//         this.isDraggingSelection = false;
//         this.isResizingColumn = false;
//         this.isResizingRow = false;
//         this.activeResizeIndex = -1;
//     };
// }