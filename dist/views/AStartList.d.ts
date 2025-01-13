import { ISelection, IViewContext } from '../base/interfaces';
import { IParams } from '../base/rest';
import { ARankingView } from '../lineup/ARankingView';
import { IARankingViewOptions } from '../lineup/IARankingViewOptions';
import { INamedSet } from '../storage/interfaces';
export interface IAStartListOptions extends IARankingViewOptions {
    namedSet: INamedSet;
}
/**
 * base class for ranking views start doen't require any input but can have as additional input a NamedSet they are representing
 */
export declare abstract class AStartList extends ARankingView {
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: Partial<IAStartListOptions>);
    protected get namedSet(): INamedSet | null;
    protected buildNamedSetFilters(namedSetIdFilterKey?: string, validFilterKey?: (key: string) => boolean): IParams;
}
//# sourceMappingURL=AStartList.d.ts.map