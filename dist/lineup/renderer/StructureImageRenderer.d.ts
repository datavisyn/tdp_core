import { ICellRendererFactory, ERenderMode, ICellRenderer, IRenderContext, IGroupCellRenderer } from 'lineupjs';
import { StructureImageColumn } from './StructureImageColumn';
export declare class StructureImageRenderer implements ICellRendererFactory {
    readonly title: string;
    canRender(col: StructureImageColumn, mode: ERenderMode): boolean;
    create(col: StructureImageColumn): ICellRenderer;
    createGroup(col: StructureImageColumn, context: IRenderContext): IGroupCellRenderer;
}
//# sourceMappingURL=StructureImageRenderer.d.ts.map