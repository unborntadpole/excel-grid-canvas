import { ResizeCol } from "./colResize.js";
import { GridState } from "../gridState.js";
import { ResizeRow } from "./rowResize.js";
import { RowHeaderSelection } from "./rowHeaderSelection.js";
import { CellSelection } from "./cellSelection.js";
import { ColumnHeaderSelection } from "./colHeaderSelection.js";


export interface MouseHandler {
    hitTest(mouseX:number, mouseY:number): boolean;
    pointerDown(mouseX:number, mouseY:number): void;
    pointerMove(mouseX:number, mouseY:number): void;
    pointerUp(mouseX: number, mouseY: number): void;
    pointerChange(): void;
}

export class MouseController {
    private state: GridState;
    private handlers: MouseHandler[] = [];
    private currentHandler: MouseHandler | null = null;
    private pointerDown : boolean = false;

    constructor(state: GridState){
        this.state = state;
        this.setupHandlers();
    }

    private setupHandlers(): void {
        this.handlers.push(new ResizeRow(this.state));
        this.handlers.push(new ResizeCol(this.state));
        this.handlers.push(new RowHeaderSelection(this.state));
        this.handlers.push(new ColumnHeaderSelection(this.state));
        this.handlers.push(new CellSelection(this.state));
    }

    public setUpListeners() : void {
        window.addEventListener('pointerdown', this.handlePointerDown);
        this.state.canvas.addEventListener('pointermove', this.handleHover);
        window.addEventListener('pointermove', this.handlePointerMove);
        window.addEventListener('pointerup', this.handlePointerUp);
    }

    public destroyListeners() : void {
        window.removeEventListener('pointerdown', this.handlePointerDown);
        this.state.canvas.removeEventListener('pointermove', this.handleHover);
        window.removeEventListener('pointermove', this.handlePointerMove);
        window.removeEventListener('pointerup', this.handlePointerUp);
    }

    private handleHover = (e: PointerEvent) : void => {
        if (this.pointerDown) return;
        e.preventDefault();
        const rect = this.state.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        this.currentHandler = null;
        this.state.canvas.style.cursor = 'cell';
        for (let i = 0; i < this.handlers.length; i++) {
            const handler = this.handlers[i];
            if (handler != undefined && handler.hitTest(mouseX,mouseY)) {
                this.currentHandler = handler;
                break;
            }
        }
        this.currentHandler?.pointerChange();
    }

    private handlePointerDown = (e: PointerEvent) : void => {
        if (this.currentHandler === null) return;
        e.preventDefault(); 
        this.state.canvas.focus();
        this.pointerDown = true;
        const rect = this.state.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        this.currentHandler?.pointerDown(mouseX, mouseY);
        this.state.grid.render();
    }

    private handlePointerMove = (e: PointerEvent) : void => {
        if (!this.pointerDown) return;
        e.preventDefault(); 
        this.state.canvas.focus();

        const rect = this.state.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        this.currentHandler?.pointerMove(mouseX, mouseY);
        this.state.grid.render();
    }

    private handlePointerUp = (e: PointerEvent) : void => {
        if (!this.pointerDown) return;
        e.preventDefault();
        this.state.canvas.focus();

        const rect = this.state.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        this.currentHandler?.pointerUp(mouseX, mouseY);
        this.pointerDown = false;
        this.state.grid.render();
    }
}