//copy paste, undo redo, resize window, scroll, initial sizing of canvas

import type { Grid } from "../grid.js";
import { CopyPaste } from "../utils/copypaste.js";
import type { GridState } from "./gridState.js";

export class Misc {
    private grid: Grid;
    private gridState : GridState;

    constructor(state: GridState){
        this.gridState = state;
        this.grid = this.gridState.grid;
        this.initCanvasSizing();
        this.initialize();
    }

    public initialize() {
        this.gridState.container.addEventListener('scroll', this.handleScroll);
        window.addEventListener('keydown', this.handleWindowKeyDown);
        this.gridState.fileInput.addEventListener('change', this.handleFileChange);
        this.gridState.fileInput.addEventListener('click', this.handleFileClick);
        window.addEventListener('resize', this.handleResize);
    }

    public destroyListeners() {
        this.gridState.container.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('keydown', this.handleWindowKeyDown);
        this.gridState.fileInput.removeEventListener('change', this.handleFileChange);
        this.gridState.fileInput.removeEventListener('click', this.handleFileClick);
        window.removeEventListener('resize', this.handleResize);
    }

    private initCanvasSizing(): void {    
        const width = this.gridState.container.clientWidth;
        const height = this.gridState.container.clientHeight;
        const dpr = window.devicePixelRatio || 1;

        this.gridState.canvas.width = width * dpr;
        this.gridState.canvas.height = height * dpr;

        this.gridState.canvas.style.width = `${width}px`;
        this.gridState.canvas.style.height = `${height}px`;

        const ctx = this.gridState.canvas.getContext('2d');
        if (ctx) {
            ctx.scale(dpr, dpr);
        }
    }
        
    private commitEditingChanges(): void {
        if (!this.gridState.currentEditingCell) return;
        this.grid.typeIntoCell(
            this.gridState.currentEditingCell.row, 
            this.gridState.currentEditingCell.col, 
            this.gridState.editor.value
        );
        this.gridState.editor.style.display = 'none';
        this.gridState.currentEditingCell = null;
    }

    private handleScroll = (): void => {
        this.grid.scrollX = this.gridState.container.scrollLeft;
        this.grid.scrollY = this.gridState.container.scrollTop;
        
        if (this.gridState.currentEditingCell) this.commitEditingChanges();
        this.grid.render();
    };

    private handleWindowKeyDown = async (e: KeyboardEvent): Promise<void> => {
        if (document.activeElement === this.gridState.editor) return;
        const key = e.key.toLowerCase();
        if (e.ctrlKey && key === 'i') {
            e.preventDefault();
            await this.grid.renderJSON();
            return;
        }
        if (e.ctrlKey && e.code == 'KeyC'){
            e.preventDefault();
            if (!this.grid.selection.boundedRange) return;
            this.gridState.copyObject = new CopyPaste(this.grid.selection.boundedRange);
            return;
        }
        if (e.ctrlKey && e.code == 'KeyV'){
            e.preventDefault();
            if (!this.gridState.currentSelectedCell || !this.gridState.copyObject) return;
            this.grid.paste(
                this.gridState.copyObject, 
                this.gridState.currentSelectedCell.row, 
                this.gridState.currentSelectedCell.col
            );
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

}