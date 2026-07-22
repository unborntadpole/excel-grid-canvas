import {Grid} from './grid.js';
import { GridState } from './eventhandlers/gridState.js';
import { HEADER_HEIGHT, HEADER_WIDTH, MAX_COLUMNS, MAX_ROWS } from './config/constants.js';
import { Column, Row } from './utils/rowcolumn.js';
import { MouseController } from './eventhandlers/mouse/mouseController.js';
import { KeyboardController } from './eventhandlers/keyboard/keyboardController.js';
import { MiscController } from './eventhandlers/misc/miscListeners.js';


export class GridApplication {
    public grid: Grid;

    private state: GridState;

    private mouseController: MouseController;
    private keyboardController: KeyboardController;
    private miscController: MiscController;

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

        this.mouseController = new MouseController(this.state);
        this.keyboardController = new KeyboardController(this.state);
        this.miscController = new MiscController(this.state);

        
        this.initListeners();
        this.initCanvasSizing();
        this.updateScrollDimensions();
        this.grid.render();
    }

    private initListeners(): void {
        
        this.mouseController.setUpListeners();
        this.keyboardController.setUpListeners();
        this.miscController.setUpListeners();
        
    }


    public destroy(): void {

        this.mouseController.destroyListeners();
        this.keyboardController.destroyListeners();
        this.miscController.destroyListeners();
    }

    private updateScrollDimensions = (): void => {
        let totalWidth = 0;
        for (let c = 0; c < MAX_COLUMNS; c++) totalWidth += Column.getWidth(c);
        
        let totalHeight = 0;
        for (let r = 0; r < MAX_ROWS; r++) totalHeight += Row.getHeight(r);

        this.state.spacer.style.width = `${totalWidth + HEADER_WIDTH}px`;
        this.state.spacer.style.height = `${totalHeight + HEADER_HEIGHT}px`;
    };

    private initCanvasSizing(): void {    
        const width = this.state.container.clientWidth;
        const height = this.state.container.clientHeight;
        const dpr = window.devicePixelRatio || 1;

        this.state.canvas.width = width * dpr;
        this.state.canvas.height = height * dpr;

        this.state.canvas.style.width = `${width}px`;
        this.state.canvas.style.height = `${height}px`;

        const ctx = this.state.canvas.getContext('2d');
        if (ctx) {
            ctx.scale(dpr, dpr);
        }
    }

}