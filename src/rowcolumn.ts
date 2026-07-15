import { DEFAULT_COLUMN_WIDTH, DEFAULT_ROW_HEIGHT } from "./config/constants.js";

const GLOBAL_COL_WIDTHS = new Map<number, number>();
const GLOBAL_ROW_HEIGHTS = new Map<number, number>();

export class Row {
    public static getHeight(key: number): number{
        const value = GLOBAL_ROW_HEIGHTS.get(key);
        return value ?? DEFAULT_ROW_HEIGHT;
    }

    public static setHeight(key: number, height: number): void{
        GLOBAL_ROW_HEIGHTS.set(key, height);
    }
}

export class Column {
    public static getWidth(key: number): number{
        const value = GLOBAL_COL_WIDTHS.get(key);
        return value ?? DEFAULT_COLUMN_WIDTH;
    }

    public static setWidth(key: number, width: number): void{
        GLOBAL_COL_WIDTHS.set(key, width);
    }
}
