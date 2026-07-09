import { Grid } from "./grid.js";
import { Row, Column } from "./rowcolumn.js";

import { GridApplication } from './eventHandler.js';

export const DEFAULT_ROW_HEIGHT = 30;
export const DEFAULT_COLUMN_WIDTH = 100;
export const MAX_ROWS = 100000;
export const MAX_COLUMNS = 50;

declare global {
    interface Window {
        __gridAppInstance?: GridApplication;
    }
}

if (window.__gridAppInstance) {
    window.__gridAppInstance.destroy();
} else {
    window.__gridAppInstance = new GridApplication();
}
