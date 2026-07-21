import {Grid} from './grid.js';
import { GridState } from './eventhandlers/gridState.js';
import { ResizeRowCol } from './eventhandlers/rowcolResize.js';
import { GridSelection } from './eventhandlers/gridSelection.js';
import { KeyboardSelection } from './eventhandlers/keyboardSelection.js';
import { Editing } from './eventhandlers/editing.js';
import { Misc } from './eventhandlers/misc.js';
import { HEADER_HEIGHT, HEADER_WIDTH, MAX_COLUMNS, MAX_ROWS } from './config/constants.js';
import { Column, Row } from './utils/rowcolumn.js';
import { MouseController } from './eventhandlers/mouse/mouseController.js';


export class GridApplication {
    public grid: Grid;

    private state: GridState;
    private misc: Misc;
    private editing: Editing;
    private rowcolResize: ResizeRowCol;
    private gridSelection: GridSelection;
    private keyboardSelection: KeyboardSelection;

    private mouseController: MouseController;

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

        this.mouseController = new MouseController(this.state);
        
        this.initListeners();
        this.updateScrollDimensions();
        this.grid.render();
    }

    private initListeners(): void {
        // this.misc.initialize();
        // this.editing.initialize();
        // this.rowcolResize.initialize();
        // this.gridSelection.initialize();
        // this.keyboardSelection.initialize();
        
        this.mouseController.setUpListeners();
    }


    public destroy(): void {
        // this.misc.destroyListeners();
        // this.editing.destroyListeners();
        // this.rowcolResize.destroyListeners();
        // this.keyboardSelection.destroyListeners();
        // this.gridSelection.destroyListeners();

        this.mouseController.destroyListeners();
    }

    private updateScrollDimensions = (): void => {
        let totalWidth = 0;
        for (let c = 0; c < MAX_COLUMNS; c++) totalWidth += Column.getWidth(c);
        
        let totalHeight = 0;
        for (let r = 0; r < MAX_ROWS; r++) totalHeight += Row.getHeight(r);

        this.state.spacer.style.width = `${totalWidth + HEADER_WIDTH}px`;
        this.state.spacer.style.height = `${totalHeight + HEADER_HEIGHT}px`;
    };

}