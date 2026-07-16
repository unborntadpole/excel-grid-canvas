export class DataStore {
    private col_widths = new Map<number, number>();
    private row_heights = new Map<number, number>();
    private cell_data = new Map<string, CellState>();

    constructor(){
        // index db future scope ??
    }

    public getColWidth(key: number){
        return this.col_widths.get(key);
    }
    public getRowHeights(key: number ){
        return this.row_heights.get(key);
    }    
    public setColWidth(key: number, width: number){
        this.col_widths.set(key, width);
    }
    public setRowHeight(key: number, height: number){
        this.row_heights.set(key, height);
    }

    public setSPARSECELLDATA(data: Map<string, CellState>){
        this.cell_data = structuredClone(data);
    }

    public getSPARSECELLDATA(): Map<string, CellState>{
        return structuredClone(this.cell_data);
    }

    public getCellData(key: string): CellState | undefined{
        if (key === "INVALID") return undefined;
        return this.cell_data.get(key);
    }

    public setRawValue(key: string, val: string): void {
        if (key === "INVALID") return;
        if (val === ''){
            this.cell_data.delete(key);
        } 
        else{
            const state = this.cell_data.get(key);
            if (state){
                state.value = val;
            } 
            else{
                this.cell_data.set(key, {value: val});
            }
        }
    }
}


export interface CellState {
    value: string
}