import { Range, RangeLike } from '../range';
export declare enum SelectOperation {
    SET = 0,
    ADD = 1,
    REMOVE = 2
}
export declare class SelectionUtils {
    static defaultSelectionType: string;
    static hoverSelectionType: string;
    /**
     * converts the given mouse event to a select operation
     * @param event the mouse event to examine
     */
    static toSelectOperation(event: MouseEvent): SelectOperation;
    /**
     * converts the given key modifiers to select operation
     * @param ctryKey
     * @param altKey
     * @param shiftKey
     * @param metaKey
     */
    static toSelectOperation(ctryKey: boolean, altKey: boolean, shiftKey: boolean, metaKey: boolean): SelectOperation;
    static asSelectOperation(v: any): number;
    static fillWithNone(r: Range, ndim: number): Range;
    static integrateSelection(current: Range, additional: RangeLike, operation?: SelectOperation): Range;
}
//# sourceMappingURL=SelectionUtils.d.ts.map