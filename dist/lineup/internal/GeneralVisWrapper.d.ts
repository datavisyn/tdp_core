import { LocalDataProvider } from 'lineupjs';
import { EventHandler } from '../..';
import { ARankingView } from '..';
export declare class GeneralVisWrapper extends EventHandler {
    readonly node: HTMLElement;
    private viewable;
    private provider;
    private view;
    private data;
    constructor(provider: LocalDataProvider, view: ARankingView, doc?: Document);
    getAllData(): any[];
    selectCallback(selected: number[]): void;
    filterCallback(s: string): void;
    updateCustomVis(): void;
    toggleCustomVis(): void;
    hide(): void;
}
