import { SingleSelectionAdapter } from './internal/SingleSelectionAdapter';
import { MultiSelectionAdapter } from './internal/MultiSelectionAdapter';
export class AdapterUtils {
    /**
     * create a single selection adapter, i.e. that one selected item results in one additional column in LineUp
     * @param {ISingleSelectionAdapter} adapter for loading and creating of those columns
     * @returns {ISelectionAdapter}
     */
    static single(adapter) {
        return new SingleSelectionAdapter(adapter);
    }
    /**
     * create a multi selection adapter, i.e that one selected item results in N additional columsn in LineUp
     * @param {IMultiSelectionAdapter} adapter adapter for loading and creating of those columns
     * @returns {ISelectionAdapter}
     */
    static multi(adapter) {
        return new MultiSelectionAdapter(adapter);
    }
    /**
     * no columns for selected items
     * @returns {ISelectionAdapter}
     */
    static none() {
        return {
            parameterChanged: () => undefined,
            selectionChanged: () => undefined,
        };
    }
}
//# sourceMappingURL=AdapterUtils.js.map