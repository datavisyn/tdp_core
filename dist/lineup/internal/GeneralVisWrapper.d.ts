import { LocalDataProvider } from 'lineupjs';
import { EventHandler } from '../../base';
import { ARankingView } from '..';
import { LineUpSelectionHelper } from './LineUpSelectionHelper';
import { IDType } from '../../idtype';
export declare class GeneralVisWrapper extends EventHandler {
    readonly node: HTMLElement;
    private viewable;
    private provider;
    private selectionHelper;
    private idType;
    private view;
    private data;
    constructor(provider: LocalDataProvider, view: ARankingView, selectionHelper: LineUpSelectionHelper, idType: IDType, doc?: Document);
    getSelectionMap(): {
        [key: number]: boolean;
    };
    getAllData(): any[];
    selectCallback(selected: number[]): void;
    filterCallback(s: string): void;
    updateCustomVis(): void;
    toggleCustomVis(): void;
    hide(): void;
}
