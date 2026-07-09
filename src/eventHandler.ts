import {Grid} from './grid.js';
import { Column, Row } from './rowcolumn.js';
import { MAX_COLUMNS, MAX_ROWS } from './script.js';

export class GridApplication {
    private container: HTMLDivElement;
    private spacer: HTMLDivElement;
    private canvas: HTMLCanvasElement;
    private editor: HTMLInputElement;
    private fileInput: HTMLInputElement;
    public grid: Grid;
    private isDraggingSelection = false;
    private isResizingColumn = false;
    private isResizingRow = false;
    private activeResizeIndex = -1;
    private initialMousePos = 0;
    private initialSize = 0;
    private currentEditingCell: { row: number; col: number } | null = null;

    constructor() {
        this.container = document.getElementById('grid-container') as HTMLDivElement;
        this.spacer = document.getElementById('grid-spacer') as HTMLDivElement;
        this.canvas = document.getElementById('my-grid-canvas') as HTMLCanvasElement;
        this.editor = document.getElementById('grid-editor') as HTMLInputElement;
        this.fileInput = document.getElementById('loaded-file') as HTMLInputElement;
        this.grid = new Grid(this.canvas);
        this.initCanvasSizing();
        this.updateScrollDimensions();
        this.initListeners();

        this.grid.render();
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

        this.spacer.style.width = `${totalWidth}px`;
        this.spacer.style.height = `${totalHeight}px`;
    };

    private getCellAtPixels(pixelX: number, pixelY: number): { row: number; col: number; x: number; y: number; w: number; h: number } {
        const absoluteX = pixelX + this.grid.scrollX;
        const absoluteY = pixelY + this.grid.scrollY;

        let currentX = 0, col = 0, cellX = 0, cellW = 0;
        for (let c = 0; c < 500; c++) {
            const cw = Column.getWidth(c);
            if (absoluteX >= currentX && absoluteX <= currentX + cw) {
                col = c; cellX = currentX - this.grid.scrollX; cellW = cw;
                break;
            }
            currentX += cw;
        }

        let currentY = 0, row = 0, cellY = 0, cellH = 0;
        for (let r = 0; r < 100000; r++) {
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
        const threshold = 4; 

        let currentX = 0;
        for (let c = 0; c < MAX_COLUMNS; c++) {
            currentX += Column.getWidth(c);
            if (Math.abs(absoluteX - currentX) <= threshold) return { type: 'col', index: c };
        }

        let currentY = 0;
        for (let r = 0; r < MAX_ROWS; r++) {
            currentY += Row.getHeight(r);
            if (Math.abs(absoluteY - currentY) <= threshold) return { type: 'row', index: r };
        }

        return { type: null, index: -1 };
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
            console.log("dragging true");
            const target = this.getCellAtPixels(mouseX, mouseY);
            this.grid.selection.selectCell(target.row, target.col);
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
            const evaluation = this.grid.selection.evaluate();
            document.getElementById("field-count")!.textContent = evaluation.count!;
            document.getElementById("field-min")!.textContent = evaluation.min!;
            document.getElementById("field-max")!.textContent = evaluation.max!;
            document.getElementById("field-average")!.textContent = evaluation.average!;
            document.getElementById("field-sum")!.textContent = evaluation.sum!;
        }
        this.isDraggingSelection = false;
        this.isResizingColumn = false;
        this.isResizingRow = false;
        this.activeResizeIndex = -1;
    };
    private handleDblClick = (e: MouseEvent): void => {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const cellTarget = this.getCellAtPixels(mouseX, mouseY);
        this.currentEditingCell = { row: cellTarget.row, col: cellTarget.col };
        const currentText = this.grid['pointerCell'].bindTo(cellTarget.row, cellTarget.col).value;
        this.editor.value = currentText;
        this.editor.style.left = `${cellTarget.x + this.container.scrollLeft}px`;
        this.editor.style.top = `${cellTarget.y + this.container.scrollTop}px`;
        this.editor.style.width = `${cellTarget.w}px`;
        this.editor.style.height = `${cellTarget.h}px`;
        this.editor.style.display = 'block';
        setTimeout(() => this.editor.focus(), 10);
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
        if (e.ctrlKey || e.metaKey) {
            if (key === 'z') {e.preventDefault();
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
}