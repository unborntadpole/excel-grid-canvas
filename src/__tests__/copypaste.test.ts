import { Cell, CellRange } from "../cell.js";
import { MAX_COLUMNS, MAX_ROWS } from "../config/constants.js";
import { DataStore } from "../datastore.js";
import { CopyPaste } from "../utils/copypaste.js";

describe.skip('Testing cell copy paste functions', () => {
    beforeAll(async () => {
        window.__datastore = new DataStore();
        new Cell().bindTo(0,0).setRawValue("5");
        new Cell().bindTo(1,0).setRawValue("6");
        new Cell().bindTo(2,0).setRawValue("3");
        new Cell().bindTo(3,0).setRawValue("2");
        new Cell().bindTo(5,0).setRawValue("hi there");
    });

    afterAll(async() => {
        
    })

    it('paste(), should paste in new location', () => {
        const cellrange = new CellRange(0,0,3,0);
        const cell = new Cell();
        const copyObject = new CopyPaste(cellrange);
        copyObject.paste({"row":1, "col":1});
        const value = [cell.bindTo(1,1).value, cell.bindTo(2,1).value, 
            cell.bindTo(3,1).value, cell.bindTo(4,1).value];
        expect(value).toEqual(["5","6","3","2"]);
    });

    it('paste(), should paste text too in new location', () => {
        const cellrange = new CellRange(4,0,5,0);
        const cell = new Cell();
        const copyObject = new CopyPaste(cellrange);
        copyObject.paste({"row":1, "col":2});
        const value = [cell.bindTo(1,2).value, cell.bindTo(2,2).value];
        expect(value).toEqual(["","hi there"]);
    });

    it('paste(), should overwrite text new location', () => {
        const cellrange = new CellRange(4,0,5,0);
        const cell = new Cell();
        const copyObject = new CopyPaste(cellrange);
        copyObject.paste({"row":0, "col":0});
        const value = [cell.bindTo(0,0).value, cell.bindTo(1,0).value, 
            cell.bindTo(2,0).value, cell.bindTo(3,0).value];
        expect(value).toEqual(["5","hi there", "3", "2"]);
    });

    it('paste(), should not crash on exceeding Max rows or cols', () => {
        const cellrange = new CellRange(0,0,3,0);
        const cell = new Cell();
        const copyObject = new CopyPaste(cellrange);
        copyObject.paste({"row":MAX_ROWS - 1, "col":0});
        const value = [cell.bindTo(MAX_ROWS - 1,0).value];
        expect(value).toEqual(["5"]);
    });

    it('paste(), should not paste beyond scope', () => {
        const cellrange = new CellRange(0,0,3,0);
        const cell = new Cell();
        const copyObject = new CopyPaste(cellrange);
        copyObject.paste({"row":0, "col":MAX_COLUMNS+100});
        const value = [cell.bindTo(0,MAX_COLUMNS+100).value];
        expect(value).toEqual([""]);
    });
});