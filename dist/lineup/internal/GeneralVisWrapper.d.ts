import { LocalDataProvider } from 'lineupjs';
import { EventHandler } from '../../base';
import { LineUpSelectionHelper } from './LineUpSelectionHelper';
import { ARankingView } from '../ARankingView';
export declare class GeneralVisWrapper extends EventHandler {
    readonly node: HTMLElement;
    private viewable;
    private provider;
    private selectionHelper;
    private view;
    private data;
    constructor(provider: LocalDataProvider, view: ARankingView, selectionHelper: LineUpSelectionHelper, doc?: Document);
    getAllData(): any[];
    selectCallback(selected: string[]): void;
    filterCallback(s: string): void;
    updateCustomVis(): void;
    toggleCustomVis(): void;
    hide(): void;
}
//# sourceMappingURL=GeneralVisWrapper.d.ts.map