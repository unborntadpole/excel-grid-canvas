import { DEFAULT_COLUMN_WIDTH, DEFAULT_ROW_HEIGHT } from "../config/constants.js";

export class Row {
    public static getHeight(key: number): number{
        if (!window.__datastore) return DEFAULT_ROW_HEIGHT;
        const value = window.__datastore.getRowHeights(key);
        return value ?? DEFAULT_ROW_HEIGHT;
    }

    public static setHeight(key: number, height: number): void{
        if (!window.__datastore) return;
        window.__datastore.setRowHeight(key, height);
    }
}

export class Column {
    public static getWidth(key: number): number{
        if (!window.__datastore) return DEFAULT_COLUMN_WIDTH;
        const value = window.__datastore.getColWidth(key);
        return value ?? DEFAULT_COLUMN_WIDTH;
    }

    public static setWidth(key: number, width: number): void{
        if (!window.__datastore) return;
        window.__datastore.setColWidth(key, width);
    }
}
