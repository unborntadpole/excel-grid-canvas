import { DataStore, type CellState } from "../datastore.js";
import { addToSheet, fetchFromJson } from "../utils/fetchFromJson.js";
import type { ICommand } from "./commands.js";

export class RenderJsonCommand implements ICommand {
    private oldValue: Map<string, CellState> | null = null;
    private newValue: Map<string, CellState> | null = null;
    private key?: string;
    private repo: DataStore | null = null;

    constructor(key?:string) {
        if (key) this.key = key;
        if (window.__datastore) this.repo = window.__datastore;
    }

    async execute() {
        if (!this.repo) return;
        if (!this.newValue) {
            this.oldValue = this.repo.getSPARSECELLDATA();
            await fetchFromJson(this.key);
            this.newValue = this.repo.getSPARSECELLDATA();
            return;
        }
        this.repo.setSPARSECELLDATA(this.newValue);
    }

    undo() {
        if (!this.repo) return;
        if (this.oldValue) {
            this.repo.setSPARSECELLDATA(this.oldValue);
        }
    }
}


export class RenderJsonFromFileCommand implements ICommand {
    private oldValue: Map<string, CellState> | null = null;
    private newValue: Map<string, CellState> | null = null;
    private repo: DataStore | null = null;

    constructor(data: unknown, firstCellKey: string) {
        if (!window.__datastore) return;
        this.repo = window.__datastore;
        this.oldValue = this.repo.getSPARSECELLDATA();
        addToSheet(data, firstCellKey);
        this.newValue = this.repo.getSPARSECELLDATA();
    }

    execute() {
        if (!this.repo || !this.newValue) return;
        this.repo.setSPARSECELLDATA(this.newValue);
    }

    undo() {
        if (!this.repo) return;
        if (this.oldValue) {
            this.repo.setSPARSECELLDATA(this.oldValue);
        }
    }
}

