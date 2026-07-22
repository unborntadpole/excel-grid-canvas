import type { GridState } from "../gridState.js";
import { KeyboardEditing } from "./cellEditing.js";
import { KeyboardCopyPaste } from "./copypaste.js";
import { KeyboardImportJson } from "./importjson.js";
import { KeyboardSelection } from "./selection.js";
import { KeyboardUndoRedo } from "./undoredo.js";

export interface KeyboardHandler {
    hitTest(e: KeyboardEvent, key: string): boolean;
    keyDown(e: KeyboardEvent, key: string): void;
    keyUp(e: KeyboardEvent, key: string): void;
}

export class KeyboardController {
    private state: GridState;
    private handlers: KeyboardHandler[] = [];
    private currentHandler: KeyboardHandler | null = null;

    constructor(state: GridState){
        this.state = state;
        this.setupHandlers();
    }

    private setupHandlers(): void {
        this.handlers.push(new KeyboardSelection(this.state));
        this.handlers.push(new KeyboardEditing(this.state));
        this.handlers.push(new KeyboardCopyPaste(this.state));
        this.handlers.push(new KeyboardImportJson(this.state));
        this.handlers.push(new KeyboardUndoRedo(this.state));
    }

    public setUpListeners() : void {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    public destroyListeners() : void {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
    }

    private handleKeyDown = (e: KeyboardEvent) : void => {
        for (let i = 0; i < this.handlers.length; i++) {
            const handler = this.handlers[i];
            if (handler != undefined && handler.hitTest(e, e.key)) {
                this.currentHandler = handler;
                break;
            }
        }
        this.currentHandler?.keyDown(e, e.key);
        this.state.grid.render();
    }

    private handleKeyUp = (e: KeyboardEvent) : void => {
        e.preventDefault();
        this.state.canvas.focus();

        this.currentHandler?.keyUp(e, e.key);
        this.state.grid.render();
    }
}