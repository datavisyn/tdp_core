import { Column } from 'lineupjs';
import { ISelection, IScoreRow, IAdditionalColumnDesc } from '../../base/interfaces';
export interface ISelectionColumn {
    readonly id: string;
    readonly desc: IAdditionalColumnDesc;
    readonly data: Promise<IScoreRow<any>[]>;
    readonly position?: number;
}
/**
 * context for the @see ISelectionAdapter
 */
export interface IContext {
    /**
     * list of currently visible columns
     */
    readonly columns: Column[];
    /**
     * the current input selection
     */
    readonly selection: ISelection;
    /**
     * add multiple columns to LineUp
     * @param {ISelectionColumn[]} columns
     */
    add(columns: ISelectionColumn[]): Promise<void>;
    /**
     * remove multiple columns from LineUp
     * @param {Column[]} columns
     */
    remove(columns: Column[]): Promise<void>;
    /**
     * free the color from the color management
     * @param {string} id
     */
    freeColor(id: string): void;
}
/**
 * adapter for handling input selections as LineUp columns
 */
export interface ISelectionAdapter {
    /**
     * called when a parameter has changed
     * @param {IContext} context
     */
    parameterChanged(context: IContext, onContextChanged?: (context: IContext) => void | IContext): Promise<IContext | void>;
    /**
     * called when the input selection has changed
     * @param {IContext} context
     */
    selectionChanged(context: IContext, onContextChanged?: (context: IContext) => void | IContext): Promise<void | IContext>;
}
//# sourceMappingURL=ISelectionAdapter.d.ts.map