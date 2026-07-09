import { Grid } from "./grid.js";
import { Row, Column } from "./rowcolumn.js";

import { GridApplication } from './eventHandler.js';

export const DEFAULT_ROW_HEIGHT = 30;
export const DEFAULT_COLUMN_WIDTH = 100;
export const MAX_ROWS = 100000;
export const MAX_COLUMNS = 50;


const app = new GridApplication();
app.grid.render();
