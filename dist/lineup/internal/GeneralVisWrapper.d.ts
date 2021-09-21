import { LocalDataProvider } from 'lineupjs';
import { EventHandler } from 'phovea_core';
import { ARankingView } from '..';
export declare class GeneralVisWrapper extends EventHandler {
    readonly node: HTMLElement;
    private viewable;
    private provider;
    private view;
    private data;
    constructor(provider: LocalDataProvider, view: ARankingView, doc?: Document);
    getAllData(): any[];
    selectCallback(selected: string[]): void;
    filterCallback(s: string): void;
    updateCustomVis(): void;
    toggleCustomVis(): void;
}
