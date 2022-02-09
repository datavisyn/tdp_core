import { ISelectionAdapter } from './ISelectionAdapter';
import { ISingleSelectionAdapter } from './internal/SingleSelectionAdapter';
import { IMultiSelectionAdapter } from './internal/MultiSelectionAdapter';
export declare class AdapterUtils {
    /**
     * create a single selection adapter, i.e. that one selected item results in one additional column in LineUp
     * @param {ISingleSelectionAdapter} adapter for loading and creating of those columns
     * @returns {ISelectionAdapter}
     */
    static single(adapter: ISingleSelectionAdapter): ISelectionAdapter;
    /**
     * create a multi selection adapter, i.e that one selected item results in N additional columsn in LineUp
     * @param {IMultiSelectionAdapter} adapter adapter for loading and creating of those columns
     * @returns {ISelectionAdapter}
     */
    static multi(adapter: IMultiSelectionAdapter): ISelectionAdapter;
    /**
     * no columns for selected items
     * @returns {ISelectionAdapter}
     */
    static none(): ISelectionAdapter;
}
//# sourceMappingURL=AdapterUtils.d.ts.map