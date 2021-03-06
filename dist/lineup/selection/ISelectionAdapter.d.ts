import { Column, IColumnDesc } from 'lineupjs';
import { ISelection } from '../../base/interfaces';
import { IScoreRow } from '../../base/interfaces';
export interface ISelectionColumn {
    readonly id: number;
    readonly desc: IColumnDesc;
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
    add(columns: ISelectionColumn[]): void;
    /**
     * remove columsn from LineUp
     * @param {Column[]} columns
     */
    remove(columns: Column[]): any;
    /**
     * free the color from the color management
     * @param {number} id
     */
    freeColor(id: number): void;
}
/**
 * adapter for handling input selections as LineUp columns
 */
export interface ISelectionAdapter {
    /**
     * called when a parameter has changed
     * @param {IContext} context
     */
    parameterChanged(waitForIt: Promise<any> | null, context: () => IContext): PromiseLike<any>;
    /**
     * called when the input selection has changed
     * @param {IContext} context
     */
    selectionChanged(waitForIt: Promise<any> | null, context: () => IContext): PromiseLike<any>;
}
