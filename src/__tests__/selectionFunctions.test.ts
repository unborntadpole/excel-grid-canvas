import { Cell, CellRange } from "../cell.js";
import { DataStore } from "../datastore.js";
import { getEvaluation } from "../utils/selectionFunctions.js";

describe('Testing cell selection functions', () => {
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

    it('getEvaluation(), should evalute a cell range', () => {
        const cellrange = new CellRange(0,0,3,0);
        expect(getEvaluation(cellrange)).toEqual({
            "count" : "4",
            "min": "2",
            "max": "6",
            "average": "4.00",
            "sum": "16"
        });
    });

    it('getEvaluation(), should safely skip text', () => {
        const cellrange = new CellRange(0,0,5,0);
        expect(getEvaluation(cellrange)).toEqual({
            "count" : "4",
            "min": "2",
            "max": "6",
            "average": "4.00",
            "sum": "16"
        });
    });

    it('getEvaluation(), should not evaluate text', () => {
        const cellrange = new CellRange(4,0,5,0);
        expect(getEvaluation(cellrange)).toEqual({
            "count" : "0",
            "min": "NaN",
            "max": "NaN",
            "average": "NaN",
            "sum": "NaN"
        });
    });
});