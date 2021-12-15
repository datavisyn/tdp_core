import { IAdditionalColumnDesc } from '../../../base/interfaces';
import { ISelectionColumn, IContext } from '../ISelectionAdapter';
export declare abstract class ABaseSelectionAdapter {
    protected addDynamicColumns(context: IContext, _ids: number[], ids: string[]): Promise<void>;
    protected removeDynamicColumns(context: IContext, _ids: number[]): void;
    private waitingForSelection;
    private waitingForParameter;
    selectionChanged(waitForIt: PromiseLike<any> | null, context: () => IContext): PromiseLike<any>;
    parameterChanged(waitForIt: PromiseLike<any> | null, context: () => IContext): PromiseLike<any>;
    protected abstract parameterChangedImpl(context: IContext): PromiseLike<any>;
    protected selectionChangedImpl(context: IContext): Promise<void>;
    protected abstract createColumnsFor(context: IContext, _id: number, id: string): PromiseLike<ISelectionColumn[]>;
    static patchDesc(desc: IAdditionalColumnDesc, selectedId: number): IAdditionalColumnDesc;
}
