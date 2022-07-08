import { ICellRendererFactory, ERenderMode, ICellRenderer, IRenderContext, IGroupCellRenderer } from 'lineupjs';
import { StructureImageColumn } from './StructureImageColumn';
export declare function getImageURL(structure: string, substructure?: string | null, align?: string | null): string;
export declare function getReducedImages(structures: string[], method?: 'single' | 'murcko' | 'mcs' | 'similarity' | 'auto'): Promise<string | null>;
export declare function svgToImageSrc(svg: string): string;
export declare function svgToCSSBackground(svg: string): string;
export declare class StructureImageRenderer implements ICellRendererFactory {
    readonly title: string;
    canRender(col: StructureImageColumn, mode: ERenderMode): boolean;
    create(col: StructureImageColumn): ICellRenderer;
    createGroup(col: StructureImageColumn, context: IRenderContext): IGroupCellRenderer;
}
//# sourceMappingURL=StructureImageRenderer.d.ts.map