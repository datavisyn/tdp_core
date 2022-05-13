import { IAdditionalColumnDesc } from '../../../base/interfaces';
import { ISelectionColumn, IContext, ISelectionAdapter } from '../ISelectionAdapter';
export declare abstract class ABaseSelectionAdapter implements ISelectionAdapter {
    protected addDynamicColumns(context: IContext, ids: string[]): Promise<void>;
    protected removeDynamicColumns(context: IContext, ids: string[]): void;
    private waitingForSelection;
    private waitingForParameter;
    /**
     * Add or remove columns in LineUp ranking when the selected items in the selection adapter context change
     * @param waitForIt additional promise to wait (e.g., wait for view to be loaded) before continuing
     * @param context selection adapter context
     * @returns A promise that can waited for until the columns have been changed.
     */
    selectionChanged(waitForIt: Promise<any> | null, context: IContext): Promise<any>;
    /**
     * Add or remove columns in LineUp ranking when the parametrs in the selection adapter context change
     * @param waitForIt additional promise to wait (e.g., wait for view to be loaded) before continuing
     * @param context selection adapter context
     * @returns A promise that can waited for until the columns have been changed.
     */
    parameterChanged(waitForIt: Promise<any> | null, context: IContext): Promise<any>;
    protected abstract parameterChangedImpl(context: IContext): Promise<any>;
    protected selectionChangedImpl(context: IContext): Promise<void>;
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