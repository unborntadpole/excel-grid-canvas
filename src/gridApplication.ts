import { CellRange } from './cell.js';
import {Grid} from './grid.js';
import { Column, Row } from './utils/rowcolumn.js';
import { DEFAULT_COLUMN_WIDTH, DEFAULT_ROW_HEIGHT, HEADER_HEIGHT, HEADER_WIDTH, MAX_COLUMNS, MAX_ROWS, RESIZE_THRESHOLD } from './config/constants.js';
import { CopyPaste } from './utils/copypaste.js';
import { DataStore } from './datastore.js';

export class GridApplication {
    private container: HTMLDivElement;
    private spacer: HTMLDivElement;
    private canvas: HTMLCanvasElement;
    private editor: HTMLInputElement;
    private fileInput: HTMLInputElement;
    public grid: Grid;
    private datastore = new DataStore();
    private isDraggingSelection = false;
    private isResizingColumn = false;
    private isResizingRow = false;
    private selectedRange: CellRange | null = null;
    private activeResizeIndex = -1;
    private initialMousePos = 0;
    private initialSize = 0;
    private copyObject: CopyPaste | null = null;
    private currentEditingCell: { row: number; col: number } | null = null;
    private currentSelectedCell: { row:number; col: number } | null = null;

    constructor() {
        window.__datastore = this.datastore;
        this.container = document.getElementById('grid-container') as HTMLDivElement;
        this.spacer = document.getElementById('grid-spacer') as HTMLDivElement;
        this.canvas = document.getElementById('my-grid-canvas') as HTMLCanvasElement;
        this.editor = document.getElementById('grid-editor') as HTMLInputElement;
        this.fileInput = document.getElementById('loaded-file') as HTMLInputElement;
        performance.mark('grid-init-start');
        this.grid = new Grid(this.canvas);
        this.initCanvasSizing();
        this.updateScrollDimensions();
        this.initListeners();
        this.grid.render();
        performance.mark('grid-init-end');
        performance.measure('Grid Initial Load Time', 'grid-init-start', 'grid-init-end');
        console.log(`Grid took ${performance.getEntriesByName('Grid Initial Load Time')[0]!.duration.toFixed(2)}ms to become interactive.`);
        performance.clearMarks();
        performance.clearMeasures();
    }

    private initCanvasSizing(): void {    
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;

        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;

        const ctx = this.canvas.getContext('2d');
        if (ctx) {
            ctx.scale(dpr, dpr);
        }
    }

    public updateScrollDimensions = (): void => {
        let totalWidth = 0;
        for (let c = 0; c < MAX_COLUMNS; c++) totalWidth += Column.getWidth(c);
        
        let totalHeight = 0;
        for (let r = 0; r < MAX_ROWS; r++) totalHeight += Row.getHeight(r);

        this.spacer.style.width = `${totalWidth + HEADER_WIDTH}px`;
        this.spacer.style.height = `${totalHeight + HEADER_HEIGHT}px`;
    };

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

    private startEditing(): void {
        if (!this.currentSelectedCell) return;
        this.currentEditingCell = {row:this.currentSelectedCell.row, col:this.currentSelectedCell.col};

        const cellTarget = this.getCellPosition(this.currentSelectedCell.row, this.currentSelectedCell.col);
        const currentText = this.grid.pointerCell.bindTo(this.currentEditingCell.row, this.currentEditingCell.col).value;

        this.editor.value = currentText;
        this.editor.style.left = `${cellTarget.x - this.container.scrollLeft}px`;
        this.editor.style.top = `${cellTarget.y - this.container.scrollTop}px`;
        this.editor.style.width = `${cellTarget.w}px`;
        this.editor.style.height = `${cellTarget.h}px`;
        this.editor.style.display = 'block';
        setTimeout(() => this.editor.focus(), 10);
    }

    private setSelectionEvaluation(): void {
        if (
            this.selectedRange !== null 
            && this.grid.selection.boundedRange 
            && this.grid.selection.boundedRange.isSame(this.selectedRange)
        ) return;
        this.selectedRange = this.grid.selection.boundedRange;
        const evaluation = this.grid.selection.evaluate();
        console.log('i got evaluated hehe');
        document.getElementById("field-count")!.textContent = evaluation.count!;
        document.getElementById("field-min")!.textContent = evaluation.min!;
        document.getElementById("field-max")!.textContent = evaluation.max!;
        document.getElementById("field-average")!.textContent = evaluation.average!;
        document.getElementById("field-sum")!.textContent = evaluation.sum!;
    }

    private initListeners(): void {
        this.container.addEventListener('scroll', this.handleScroll);
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('dblclick', this.handleDblClick);
        this.editor.addEventListener('keydown', this.handleEditorKeyDown);
        this.editor.addEventListener('blur', this.handleEditorBlur);
        window.addEventListener('keydown', this.handleWindowKeyDown);
        this.fileInput.addEventListener('change', this.handleFileChange);
        this.fileInput.addEventListener('click', this.handleFileClick);
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('keydown', this.handleArrowKeys);
        window.addEventListener('keydown', this.handleShiftDown);
        window.addEventListener('keyup', this.handleShiftUp);
    }


    public destroy(): void {
        this.container.removeEventListener('scroll', this.handleScroll);
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('dblclick', this.handleDblClick);
        this.editor.removeEventListener('keydown', this.handleEditorKeyDown);
        this.editor.removeEventListener('blur', this.handleEditorBlur);
        window.removeEventListener('keydown', this.handleWindowKeyDown);
        this.fileInput.removeEventListener('change', this.handleFileChange);
        this.fileInput.removeEventListener('click', this.handleFileClick);
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('keydown', this.handleArrowKeys);
        window.removeEventListener('keydown', this.handleShiftDown);
        window.removeEventListener('keyup', this.handleShiftUp);
    }


    private handleScroll = (): void => {
        this.grid.scrollX = this.container.scrollLeft;
        this.grid.scrollY = this.container.scrollTop;
        
        if (this.currentEditingCell) this.commitEditingChanges();
        this.grid.render();
    };

    private handleMouseDown = (e: MouseEvent): void => {
        e.preventDefault(); 
        this.canvas.focus();
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const cellTarget = this.getCellAtPixels(mouseX, mouseY);
        this.currentSelectedCell = { row: cellTarget.row, col: cellTarget.col };

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
        if (resizeHit.type === 'col') {
            this.isResizingColumn = true;
            this.activeResizeIndex = resizeHit.index;
            this.initialMousePos = e.clientX;
            this.initialSize = Column.getWidth(this.activeResizeIndex);
        } else if (resizeHit.type === 'row') {
            this.isResizingRow = true;
            this.activeResizeIndex = resizeHit.index;
            this.initialMousePos = e.clientY;
            this.initialSize = Row.getHeight(this.activeResizeIndex);
        } else {
            this.isDraggingSelection = true;
            if (this.currentEditingCell) this.commitEditingChanges();
            const target = this.getCellAtPixels(mouseX, mouseY);
            this.grid.selection.selectCell(target.row, target.col);
            this.setSelectionEvaluation();
            this.grid.render();
        }
    };

    private handleMouseMove = (e: MouseEvent): void => {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (this.isResizingColumn) {
            const delta = e.clientX - this.initialMousePos;
            const newWidth = Math.max(30, this.initialSize + delta); 
            Column.setWidth(this.activeResizeIndex, newWidth);
            this.updateScrollDimensions();
            this.grid.render();
            return;
        }

        if (this.isResizingRow) {
            const delta = e.clientY - this.initialMousePos;
            const newHeight = Math.max(18, this.initialSize + delta);
            Row.setHeight(this.activeResizeIndex, newHeight);
            this.updateScrollDimensions();
            this.grid.render();
            return;
        }

        if (this.isDraggingSelection) {
            const target = this.getCellAtPixels(mouseX, mouseY);
            this.grid.selection.updateDragRange(target.row, target.col);
            this.setSelectionEvaluation();
            this.grid.render();
            return;
        }

        const hit = this.checkResizeTarget(mouseX, mouseY);
        if (hit.type === 'col') this.canvas.style.cursor = 'col-resize';
        else if (hit.type === 'row') this.canvas.style.cursor = 'row-resize';
        else this.canvas.style.cursor = 'cell';
    };

    private handleMouseUp = (e: MouseEvent): void => {
        if (this.isResizingColumn) {
            const delta = e.clientX - this.initialMousePos;
            Column.setWidth(this.activeResizeIndex, this.initialSize);
            this.grid.resizeColumn(this.activeResizeIndex, Math.max(30, this.initialSize + delta));
        } else if (this.isResizingRow) {
            const delta = e.clientY - this.initialMousePos;
            Row.setHeight(this.activeResizeIndex, this.initialSize);
            this.grid.resizeRow(this.activeResizeIndex, Math.max(18, this.initialSize + delta));
        }

        if (this.isDraggingSelection) {
            this.setSelectionEvaluation();
        }
        this.isDraggingSelection = false;
        this.isResizingColumn = false;
        this.isResizingRow = false;
        this.activeResizeIndex = -1;
    };
    private handleDblClick = (e: MouseEvent): void => {
        this.startEditing();
    };
    
    private commitEditingChanges(): void {
        if (!this.currentEditingCell) return;
        this.grid.typeIntoCell(this.currentEditingCell.row, this.currentEditingCell.col, this.editor.value);
        this.editor.style.display = 'none';
        this.currentEditingCell = null;
    }

    private handleEditorKeyDown = (e: KeyboardEvent): void => {
        if (e.key === 'Enter') {
            this.commitEditingChanges();
            this.canvas.focus();
        } 
        else if (e.key === 'Escape') {
            this.editor.style.display = 'none';
            this.currentEditingCell = null;
            this.canvas.focus();
        }
    };
    private handleEditorBlur = (): void => {
        this.commitEditingChanges();
    };
    private handleWindowKeyDown = async (e: KeyboardEvent): Promise<void> => {
        if (document.activeElement === this.editor) return;
        const key = e.key.toLowerCase();
        if (e.ctrlKey && key === 'i') {
            e.preventDefault();
            await this.grid.renderJSON();
            return;
        }
        if (e.key === "Enter") {
            e.preventDefault();
            this.startEditing();
        }
        if (e.ctrlKey && e.code == 'KeyC'){
            e.preventDefault();
            if (!this.grid.selection.boundedRange) return;
            this.copyObject = new CopyPaste(this.grid.selection.boundedRange);
            return;
        }
        if (e.ctrlKey && e.code == 'KeyV'){
            e.preventDefault();
            if (!this.currentSelectedCell || !this.copyObject) return;
            this.grid.paste(this.copyObject, this.currentSelectedCell.row, this.currentSelectedCell.col);
            this.grid.render();
            return;
        }
        if (e.ctrlKey && e.code == 'KeyO'){
            e.preventDefault();
            document.getElementById('loaded-file')?.click();
            return;
        }
        if (e.ctrlKey || e.metaKey) {
            if (key === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    this.grid.redo();
                } 
                else {
                    this.grid.undo();
                }
            } 
            else if (key === 'y') {
                e.preventDefault();
                this.grid.redo();
            }
            return;
        }
    };
    private handleFileChange = async (event: Event) => {
        const target = event.target as HTMLInputElement;
        if (!target.files || target.files.length === 0) {
            console.log("No file selected.");
            return;
        }
        const file = target.files[0]!;
        console.log(`Selected file name: ${file.name}`);
        console.log(`File size: ${file.size} bytes`);
        const reader = new FileReader();
        reader.onload = async (e: ProgressEvent<FileReader>) => {
            try {
                const rawText = e.target?.result as string;
                const jsonData = JSON.parse(rawText);
                await this.grid.renderJSONFromFile(jsonData);
                console.log("Successfully parsed JSON data");
            } 
            catch (error) {
                console.error("Invalid JSON file uploaded.", error);
            }
        };
        reader.readAsText(file);
    };
    private handleFileClick = (event: Event): void => {
        const input = event.target as HTMLInputElement;
        input.value = '';
    };

    private handleResize = (e: Event) => {
        this.initCanvasSizing();
        this.grid.render();
    };

    private repositionGrid(): void{
        if (!this.currentSelectedCell) return;
        const row = this.currentSelectedCell.row;
        const col = this.currentSelectedCell.col;
        const gridFirstLastCells = this.grid.renderer.gridFirstLastCells;
        const rowlast = gridFirstLastCells.lr!;
        const collast = gridFirstLastCells.lc!;
        const rowfirst = gridFirstLastCells.fr!;
        const colfirst = gridFirstLastCells.fc!;

        if (row == 0){
            if (col == 0){
                this.container.scrollTop = 0;
                this.container.scrollLeft = 0;
                return;
            }
            else{
                this.container.scrollTop = 0;
            }
        } else if (col == 0){
            this.container.scrollLeft = 0;
        }
        
        let changeX = 0;
        let changeY = 0;
        if (row > rowlast){
            for(let rowT = row; rowT >= rowlast; rowT--){
                changeY += Row.getHeight(rowT);
            }
        } 
        else if ( row < rowfirst){
            for(let rowT = row; rowT <= rowfirst; rowT++){
                changeY -= Row.getHeight(rowT);
            }
        }
        else if ( col > collast){
            for(let colT = col; colT >= collast; colT--){
                changeX += Column.getWidth(colT);
            }
        }
        else if ( col < colfirst){
            for(let colT = col; colT <= colfirst; colT++){
                changeX -= Column.getWidth(colT);
            }
        }
        this.container.scrollLeft += changeX;
        this.container.scrollTop += changeY;
    }


    private setSelectedCell(row: number, column: number): void {
        if (this.grid.selection.boundedRange === null){
            this.grid.selection.selectCell(0,0);
            this.container.scrollLeft = 0;
            this.container.scrollTop = 0;
        }
        else{
            if (this.isDraggingSelection){
                this.grid.selection.updateDragRange(row,column);

            }
            else {
                this.grid.selection.selectCell(row,column);
            }
        }
        this.currentSelectedCell = {
            row: row,
            col: column
        };
        this.setSelectionEvaluation();
        this.repositionGrid();
        this.grid.render();
    }

    private handleShiftDown = (e: KeyboardEvent): void => {
        if (document.activeElement === this.editor) return;
        if (e.key.toLowerCase() === 'shift') {
            this.isDraggingSelection = true;
        }
    }

    private handleShiftUp = (e: KeyboardEvent): void => {
        if (document.activeElement === this.editor) return;
        if (e.key.toLowerCase() === 'shift') {
            this.isDraggingSelection = false;
        }
    }

    private handleArrowKeys = async (e: KeyboardEvent): Promise<void> => {
        if (document.activeElement === this.editor) return;
        const key = e.key.toLowerCase();
        if (!this.currentSelectedCell){
            this.currentSelectedCell = { 
                row: this.grid.selection.activeRow, 
                col: this.grid.selection.activeColumn
            };
        }
        const row = this.currentSelectedCell.row;
        const col = this.currentSelectedCell.col;
        switch(key) {
            case "arrowup":
                e.preventDefault();
                this.setSelectedCell(Math.max(0, row - 1), col);
                break;
            case "arrowdown":
                e.preventDefault();
                this.setSelectedCell(Math.min(MAX_ROWS, row + 1), col);
                break;
            case "arrowright":
                e.preventDefault();
                this.setSelectedCell(row, Math.min(col + 1, MAX_COLUMNS));
                break;
            case "arrowleft":
                e.preventDefault();
                this.setSelectedCell(row, Math.max(0, col -1));
                break;
        }
    }

}