import { Cell, Selection } from "../cell.js";
import { MAX_ROWS } from "../config/constants.js";
import { DataStore } from "../datastore.js";

describe('Testing Cell and Selection', () => {
    beforeAll(async () => {
        window.__datastore = new DataStore();
    });

    afterAll(async() => {
        
    })

    it('cell setRawValue() and value, should store and retrieve a value in cell', () => {
        const cell = new Cell();
        cell.bindTo(0,0).setRawValue("100");
        expect(cell.bindTo(0,0).value).toBe("100");
    });
    it('cell setRawValue() and value, should return "" on exceeding limit', () => {
        const cell = new Cell();
        cell.bindTo(MAX_ROWS+100,0).setRawValue("100");
        expect(cell.bindTo(MAX_ROWS+100,0).key).toBe("INVALID");
        expect(cell.bindTo(MAX_ROWS+100,0).value).toBe("");
    });
    it('selection evaluate(), should get selection evaluation', () => {
        const cell = new Cell();
        cell.bindTo(0,0).setRawValue("5");
        cell.bindTo(1,0).setRawValue("6");
        cell.bindTo(2,0).setRawValue("3");
        cell.bindTo(3,0).setRawValue("2");
        const selection = new Selection();
        selection.selectCell(0,0);
        selection.updateDragRange(3,0);
        expect(selection.evaluate()).toEqual({
            "count" : "4",
            "min": "2",
            "max": "6",
            "average": "4.00",
            "sum": "16"
        });
    });
    it('selection evaluate(), should return initial empty object when there is no selection at all', () => {
        const selection = new Selection();
        expect(selection.evaluate()).toEqual({
            "count" : "0",
            "min": "",
            "max": "",
            "average": "",
            "sum": ""
        });
    });
});