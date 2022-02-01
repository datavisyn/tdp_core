import { IAdditionalColumnDesc } from '../../../base/interfaces';
import { ISelectionColumn, IContext, ISelectionAdapter } from '../ISelectionAdapter';
export declare abstract class ABaseSelectionAdapter implements ISelectionAdapter {
    protected addDynamicColumns(context: IContext, ids: string[]): Promise<void>;
    protected removeDynamicColumns(context: IContext, _ids: string[]): void;
    private waitingForSelection;
    private waitingForParameter;
    selectionChanged(waitForIt: PromiseLike<any> | null, context: () => IContext): PromiseLike<any>;
    parameterChanged(waitForIt: PromiseLike<any> | null, context: () => IContext): PromiseLike<any>;
    protected abstract parameterChangedImpl(context: IContext): PromiseLike<any>;
    protected selectionChangedImpl(context: IContext): Promise<void>;
    protected abstract createColumnsFor(context: IContext, _id: string): PromiseLike<ISelectionColumn[]>;
    static patchDesc(desc: IAdditionalColumnDesc, selectedId: string): IAdditionalColumnDesc;
}
//# sourceMappingURL=ABaseSelectionAdapter.d.ts.map