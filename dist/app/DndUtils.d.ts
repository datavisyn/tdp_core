export type IDragEffect = 'none' | 'copy' | 'copyLink' | 'copyMove' | 'link' | 'linkMove' | 'move' | 'all';
export interface IDragStartResult {
    effectAllowed: IDragEffect;
    data: {
        [mimeType: string]: string;
    };
}
export interface IDropResult {
    effect: IDragEffect;
    data: {
        [mimeType: string]: string;
    };
}
export declare class DnDUtils {
    /**
     * utility for drag-n-drop support
     * @param e
     * @param typesToCheck
     * @returns {any}
     */
    hasDnDType(e: DragEvent, ...typesToCheck: string[]): boolean;
    /**
     * helper storage for dnd in edge since edge doesn't support custom mime-types
     * @type {Map<number, {[p: string]: string}>}
     */
    private dndTransferStorage;
    isEdgeDnD(e: DragEvent): boolean;
    /**
     * checks whether it is a copy operation
     * @param e
     * @returns {boolean|RegExpMatchArray}
     */
    copyDnD(e: DragEvent): boolean;
    /**
     * updates the drop effect accoriding to the current copyDnD state
     * @param e
     */
    updateDropEffect(e: DragEvent): void;
    /**
     * add drag support for the given element
     * @param {HTMLElement} node
     * @param {() => IDragStartResult} onDragStart callback to compute the payload an object of mime types
     * @param {boolean} stopPropagation whether to stop propagation in case of success
     */
    dragAble(node: HTMLElement, onDragStart: () => IDragStartResult, stopPropagation?: boolean): void;
    /**
     * add dropable support for the given node
     * @param {HTMLElement} node
     * @param {string[]} mimeTypes mimeTypes to look for
     * @param {(result: IDropResult, e: DragEvent) => boolean} onDrop callback when dropped, returns true if the drop was successful
     * @param {(e: DragEvent) => void} onDragOver optional drag over handler, e.g. for special effects
     * @param {boolean} stopPropagation flag if the event propagation should be stopped in case of success
     */
    dropAble(node: HTMLElement, mimeTypes: string[], onDrop: (result: IDropResult, e: DragEvent) => boolean, onDragOver?: null | ((e: DragEvent) => void), stopPropagation?: boolean): void;
    private static instance;
    static getInstance(): DnDUtils;
}
//# sourceMappingURL=DndUtils.d.ts.map