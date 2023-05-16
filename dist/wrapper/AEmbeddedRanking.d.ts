import { IColumnDesc, LocalDataProvider } from 'lineupjs';
import { IRow } from 'visyn_core/base';
import { ProvenanceGraph } from '../clue/provenance';
import { ARankingView } from '../lineup/ARankingView';
import { IARankingViewOptions } from '../lineup/IARankingViewOptions';
import { IViewProviderLocal } from '../lineup/internal/cmds';
import { IScore } from '../base/interfaces';
import { IFormElementDesc } from '../form/interfaces';
import { ILazyLoadedColumn } from '../lineup/internal/column';
export interface IEmbeddedRanking extends ARankingView {
    rebuildLineUp(mode: 'data' | 'scores' | 'data+scores' | 'data+desc+scores' | 'data+desc'): Promise<any>;
    runWithoutTracking<T>(f: () => T): Promise<T>;
}
export declare abstract class AEmbeddedRanking<T extends IRow> implements IViewProviderLocal {
    readonly node: HTMLElement;
    private ranking;
    /**
     * available after the ranking has been built
     */
    data: LocalDataProvider;
    constructor(node: HTMLElement);
    getInstance(): IEmbeddedRanking;
    protected buildRanking(graph: ProvenanceGraph, refKey: string, options?: Partial<IARankingViewOptions>): Promise<LocalDataProvider>;
    protected abstract loadColumnDescs(): Promise<IColumnDesc[]> | IColumnDesc[];
    protected abstract loadRows(): Promise<T[]> | T[];
    protected abstract createInitialRanking(lineup: LocalDataProvider): void;
    protected selectedRowsChanged(_rows: T[]): void;
    protected initialized(): void;
    protected setSelectedRows(rows: T[]): void;
    protected rebuild(mode?: 'data' | 'scores' | 'data+scores' | 'data+desc+scores' | 'data+desc'): Promise<void>;
    protected runWithoutTracking<D>(f: (lineup: LocalDataProvider) => D): Promise<D>;
    protected addTrackedScoreColumn(scoreId: string, scoreParams: any, position?: number): Promise<ILazyLoadedColumn[]>;
    protected addTrackedScoreColumn(score: IScore<any>, position?: number): Promise<ILazyLoadedColumn>;
    update(): void;
    /**
     * return a list of FormBuilder element descriptions to build the parameter form
     * @returns {IFormElementDesc[]}
     */
    protected getParameterFormDescs(): IFormElementDesc[];
}
//# sourceMappingURL=AEmbeddedRanking.d.ts.map