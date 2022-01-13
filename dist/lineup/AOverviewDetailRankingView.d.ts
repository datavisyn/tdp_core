import { LocalDataProvider } from 'lineupjs';
import { ARankingView } from './ARankingView';
import { IARankingViewOptions } from './IARankingViewOptions';
import { ISelection, IViewContext } from '../base/interfaces';
import { IRow } from '../base/rest';
export declare abstract class AOverviewDetailRankingView extends ARankingView {
    protected readonly overview: HTMLElement;
    private readonly split;
    private lineup;
    private overviewColumn;
    protected readonly triggerOverviewUpdateDelayed: (...args: any[]) => void;
    protected readonly triggerUpdateDelayed: (...args: any[]) => void;
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: Partial<IARankingViewOptions>);
    protected initImpl(): Promise<any>;
    protected showDetailRanking(showRanking?: boolean): void;
    protected setRatio(ratio?: number): void;
    /**
     * wrap with phovea split layout
     */
    private wrapTable;
    protected builtLineUp(lineup: LocalDataProvider): void;
    protected triggerOverviewUpdate(): void;
    protected setRowSelection(rows: IRow[]): void;
    protected getRowSelection(): Set<IRow>;
    protected focusOn(rows?: IRow[], name?: string): void;
    protected abstract buildOverview(): Promise<any> | void;
    protected abstract updateOverview(rows: IRow[], width: number, height: number, focus?: {
        name: string;
        rows: IRow[];
    }): void;
}
