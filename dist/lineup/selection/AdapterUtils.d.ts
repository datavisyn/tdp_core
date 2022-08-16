import { ISelectionAdapter } from './ISelectionAdapter';
import { ISingleSelectionAdapter } from './internal/SingleSelectionAdapter';
import { IMultiSelectionAdapter } from './internal/MultiSelectionAdapter';
export declare class AdapterUtils {
    /**
     * Create a single selection adapter, i.e. that one selected item results in one additional column in LineUp
     * @param adapter Adapter for loading and creating of those columns
     * @returns Returns the selection adapter
     */
    static single(adapter: ISingleSelectionAdapter): ISelectionAdapter;
    /**
     * Create a multi selection adapter, i.e that one selected item results in N additional columms in LineUp
     * The generic `T` is typing the _selected subtypes_ which is by default a list of strings.
     * @param adapter Adapter adapter for loading and creating of those columns
     * @returns Returns the selection adapter
     */
    static multi<T = string>(adapter: IMultiSelectionAdapter<T>): ISelectionAdapter;
    /**
     * No columns for selected items
     * @returns Returns a no-op selection adapter
     */
    static none(): ISelectionAdapter;
}
//# sourceMappingURL=AdapterUtils.d.ts.map