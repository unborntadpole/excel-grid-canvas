import { Cell } from "../cell.js";
import { DataStore } from "../datastore.js";
import { checkFormula } from "../utils/formulae.js";

describe('Testing formulae function', () => {
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

    it('checkFormula(), should evalute a formula', () => {
        const formula = '=Sum(a1,a2,a3,a4)';
        expect(checkFormula(formula)).toBe("16");
    });
    it('checkFormula(), should return "" without = in the beginning', () => {
        const formula = 'Sum(a1,a2,a3,a4)';
        expect(checkFormula(formula)).toBe("");
    });
    it('checkFormula(), invalid formula name', () => {
        const formula = '=average(a1,a2,a3,a4)';
        expect(checkFormula(formula)).toBe("INVALID FORMULA");
    });
    it('checkFormula(), should exclude empty text', () => {
        const formula = '=Sum(a1,a2,a3,a4,a5)';
        expect(checkFormula(formula)).toBe("16");
    });
    it('checkFormula(), testing =sum()', () => {
        const formula = '=Sum(a1,a2,a3,a4,a6)';
        expect(checkFormula(formula)).toBe("16");
    });
    it('checkFormula(), testing =median()', () => {
        const formula = '=median(a1,a2,a3,a4,a6)';
        expect(checkFormula(formula)).toBe("4");
    });
    it('checkFormula(), testing =avg()', () => {
        const formula = '=avg(a1,a2,a3,a4,a6)';
        expect(checkFormula(formula)).toBe("4.00");
    });
    it('checkFormula(), testing =mean()', () => {
        const formula = '=mean(a1,a2,a3,a4,a6)';
        expect(checkFormula(formula)).toBe("4.00");
    });
    
});