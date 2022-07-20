import { ADialog, IDialogContext, IRankingHeaderContext } from 'lineupjs';
import { StructureImageColumn } from './StructureImageColumn';
export declare class StructureImageFilterDialog extends ADialog {
    private readonly column;
    private readonly ctx;
    private readonly before;
    constructor(column: StructureImageColumn, dialog: IDialogContext, ctx: IRankingHeaderContext);
    private findLoadingNode;
    private findErrorNode;
    private updateFilter;
    protected reset(): void;
    protected cancel(): void;
    protected submit(): boolean;
    protected build(node: HTMLElement): void;
}
//# sourceMappingURL=StructureImageFilterDialog.d.ts.map