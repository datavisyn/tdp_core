import { IAdditionalColumnDesc } from '../../../base/interfaces';
import { IContext, ISelectionAdapter, ISelectionColumn } from '../ISelectionAdapter';
export declare abstract class ABaseSelectionAdapter implements ISelectionAdapter {
    protected addDynamicColumns(context: IContext, ids: string[]): Promise<void>;
    protected removeDynamicColumns(context: IContext, ids: string[]): Promise<void>;
    /**
     * Add or remove columns in LineUp ranking when the selected items in the selection adapter context change
     * @param context selection adapter context
     * @returns A promise that can waited for until the columns have been changed.
     */
    selectionChanged(context: IContext, onContextChanged?: (context: IContext) => void | IContext): Promise<void | IContext>;
    /**
     * Add or remove columns in LineUp ranking when the parametrs in the selection adapter context change
     * @param context selection adapter context
     * @returns A promise that can waited for until the columns have been changed.
     */
    parameterChanged(context: IContext, onContextChanged?: (context: IContext) => void | IContext): Promise<IContext | void>;
    protected abstract parameterChangedImpl(context: IContext, onContextChanged?: (context: IContext) => void | IContext): Promise<void | IContext>;
    protected selectionChangedImpl(context: IContext, onContextChanged?: (context: IContext) => void | IContext): Promise<void | IContext>;
    /**
     * Create a column desc with additional metadata for a given selected id.
     *
     * The function is marked as abstract, because based on the implementation one or multiple columns
     * can be added for the given id.
     *
     * @param context selection adapter context
     * @param id id of the selected item
     * @returns A promise with the list of columns + additional metadata
     */
    protected abstract createColumnsFor(context: IContext, id: string): Promise<ISelectionColumn[]>;
    static patchDesc(desc: IAdditionalColumnDesc, selectedId: string): IAdditionalColumnDesc;
}
//# sourceMappingURL=ABaseSelectionAdapter.d.ts.map