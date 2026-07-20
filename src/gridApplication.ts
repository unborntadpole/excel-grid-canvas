import {Grid} from './grid.js';
import { GridState } from './eventhandlers/gridState.js';
import { ResizeRowCol } from './eventhandlers/rowcolResize.js';
import { GridSelection } from './eventhandlers/gridSelection.js';
import { KeyboardSelection } from './eventhandlers/keyboardSelection.js';
import { Editing } from './eventhandlers/editing.js';
import { Misc } from './eventhandlers/misc.js';


export class GridApplication {
    public grid: Grid;

    private state: GridState;
    private misc: Misc;
    private editing: Editing;
    private rowcolResize: ResizeRowCol;
    private gridSelection: GridSelection;
    private keyboardSelection: KeyboardSelection;

    constructor() {
        this.state = new GridState();
        window.__datastore = this.state.datastore;
        this.grid = this.state.grid;
        this.grid.render();
        performance.mark('grid-init-end');
        performance.measure('Grid Initial Load Time', 'grid-init-start', 'grid-init-end');
        console.log(`Grid took ${performance.getEntriesByName('Grid Initial Load Time')[0]!.duration.toFixed(2)}ms to become interactive.`);
        performance.clearMarks();
        performance.clearMeasures();

        this.misc = new Misc(this.state);
        this.editing = new Editing(this.state);
        this.rowcolResize = new ResizeRowCol(this.state);
        this.gridSelection = new GridSelection(this.state);
        this.keyboardSelection = new KeyboardSelection(this.state);
        
        // this.initListeners();
        this.grid.render();
    }

    // private initListeners(): void {

    // }


    public destroy(): void {
        this.misc.destroyListeners();
        this.editing.destroyListeners();
        this.rowcolResize.destroyListeners();
        this.keyboardSelection.destroyListeners();
        this.gridSelection.destroyListeners();
    }

}