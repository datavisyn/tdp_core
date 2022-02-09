import { LocalDataProvider } from 'lineupjs';
import { LineUpSelectionHelper } from './LineUpSelectionHelper';
import { EventHandler } from '../../base/event';
import { IDType } from '../../idtype/IDType';
export declare class GeneralVisWrapper extends EventHandler {
    readonly node: HTMLElement;
    private viewable;
    private provider;
    private idType;
    private lineupSelectionHelper;
    private data;
    constructor(provider: LocalDataProvider, idType: IDType, lineupSelectionHelper: LineUpSelectionHelper, doc?: Document);
    getAllData(): any[];
    selectCallback(selected: number[]): void;
    filterCallback(s: string): void;
    updateCustomVis(): void;
    toggleCustomVis(): void;
    hide(): void;
}
//# sourceMappingURL=GeneralVisWrapper.d.ts.map