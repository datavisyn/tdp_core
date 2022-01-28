import { UniqueIdManager } from './UniqueIdManager';
export class DnDUtils {
    constructor() {
        /**
         * helper storage for dnd in edge since edge doesn't support custom mime-types
         * @type {Map<number, {[p: string]: string}>}
         */
        this.dndTransferStorage = new Map();
    }
    /**
     * utility for drag-n-drop support
     * @param e
     * @param typesToCheck
     * @returns {any}
     */
    hasDnDType(e, ...typesToCheck) {
        const available = e.dataTransfer.types;
        /*
         * In Chrome datatransfer.types is an Array,
         * while in Firefox it is a DOMStringList
         * that only implements a contains-method!
         */
        if (typeof available.indexOf === 'function') {
            return typesToCheck.some((type) => available.indexOf(type) >= 0);
        }
        if (typeof available.includes === 'function') {
            return typesToCheck.some((type) => available.includes(type));
        }
        if (typeof available.contains === 'function') {
            return typesToCheck.some((type) => available.contains(type));
        }
        return false;
    }
    isEdgeDnD(e) {
        return DnDUtils.getInstance().dndTransferStorage.size > 0 && DnDUtils.getInstance().hasDnDType(e, 'text/plain');
    }
    /**
     * checks whether it is a copy operation
     * @param e
     * @returns {boolean|RegExpMatchArray}
     */
    copyDnD(e) {
        const dT = e.dataTransfer;
        return Boolean((e.ctrlKey && dT.effectAllowed.match(/copy/gi)) || !dT.effectAllowed.match(/move/gi));
    }
    /**
     * updates the drop effect accoriding to the current copyDnD state
     * @param e
     */
    updateDropEffect(e) {
        const dT = e.dataTransfer;
        if (DnDUtils.getInstance().copyDnD(e)) {
            dT.dropEffect = 'copy';
        }
        else {
            dT.dropEffect = 'move';
        }
    }
    /**
     * add drag support for the given element
     * @param {HTMLElement} node
     * @param {() => IDragStartResult} onDragStart callback to compute the payload an object of mime types
     * @param {boolean} stopPropagation whether to stop propagation in case of success
     */
    dragAble(node, onDragStart, stopPropagation = false) {
        const id = UniqueIdManager.getInstance().uniqueId('edgeDragHelper');
        node.draggable = true;
        node.addEventListener('dragstart', (e) => {
            node.classList.add('phovea-dragging');
            const payload = onDragStart();
            e.dataTransfer.effectAllowed = payload.effectAllowed;
            if (stopPropagation) {
                e.stopPropagation();
            }
            const keys = Object.keys(payload.data);
            const allSucceded = keys.every((k) => {
                try {
                    e.dataTransfer.setData(k, payload.data[k]);
                    return true;
                }
                catch (err) {
                    return false;
                }
            });
            if (allSucceded) {
                return;
            }
            // compatibility mode for edge
            const text = payload.data['text/plain'] || '';
            e.dataTransfer.setData('text/plain', `${id}${text ? `: ${text}` : ''}`);
            DnDUtils.getInstance().dndTransferStorage.set(id, payload.data);
        });
        node.addEventListener('dragend', (e) => {
            node.classList.remove('phovea-dragging');
            if (stopPropagation) {
                e.stopPropagation();
            }
            if (DnDUtils.getInstance().dndTransferStorage.size > 0) {
                // clear the id
                DnDUtils.getInstance().dndTransferStorage.delete(id);
            }
        });
        node.addEventListener('dragexit', (e) => {
            node.classList.remove('phovea-dragging');
            if (stopPropagation) {
                e.stopPropagation();
            }
        });
    }
    /**
     * add dropable support for the given node
     * @param {HTMLElement} node
     * @param {string[]} mimeTypes mimeTypes to look for
     * @param {(result: IDropResult, e: DragEvent) => boolean} onDrop callback when dropped, returns true if the drop was successful
     * @param {(e: DragEvent) => void} onDragOver optional drag over handler, e.g. for special effects
     * @param {boolean} stopPropagation flag if the event propagation should be stopped in case of success
     */
    dropAble(node, mimeTypes, onDrop, onDragOver = null, stopPropagation = false) {
        node.addEventListener('dragenter', (e) => {
            // var xy = mouse($node.node());
            if (DnDUtils.getInstance().hasDnDType(e, ...mimeTypes) || DnDUtils.getInstance().isEdgeDnD(e)) {
                node.classList.add('phovea-dragover');
                if (stopPropagation) {
                    e.stopPropagation();
                }
                // sounds good
                return false;
            }
            // not a valid mime type
            node.classList.remove('phovea-dragover');
            return undefined;
        });
        node.addEventListener('dragover', (e) => {
            if (DnDUtils.getInstance().hasDnDType(e, ...mimeTypes) || DnDUtils.getInstance().isEdgeDnD(e)) {
                e.preventDefault();
                DnDUtils.getInstance().updateDropEffect(e);
                node.classList.add('phovea-dragover');
                if (stopPropagation) {
                    e.stopPropagation();
                }
                if (onDragOver) {
                    onDragOver(e);
                }
                // sound good
                return false;
            }
            return undefined;
        });
        node.addEventListener('dragleave', (evt) => {
            evt.target.classList.remove('phovea-dragover');
        });
        node.addEventListener('drop', (e) => {
            e.preventDefault();
            if (stopPropagation) {
                e.stopPropagation();
            }
            const effect = e.dataTransfer.effectAllowed;
            node.classList.remove('phovea-dragover');
            {
                const cleanup = node.ownerDocument.querySelector('.phovea-dragging');
                if (cleanup) {
                    cleanup.classList.remove('phovea-dragging');
                }
            }
            if (DnDUtils.getInstance().isEdgeDnD(e)) {
                const base = e.dataTransfer.getData('text/plain');
                const id = parseInt(base.indexOf(':') >= 0 ? base.substring(0, base.indexOf(':')) : base, 10);
                if (DnDUtils.getInstance().dndTransferStorage.has(id)) {
                    const data = DnDUtils.getInstance().dndTransferStorage.get(id);
                    DnDUtils.getInstance().dndTransferStorage.delete(id);
                    return !onDrop({ effect, data }, e);
                }
                return undefined;
            }
            if (DnDUtils.getInstance().hasDnDType(e, ...mimeTypes)) {
                const data = {};
                // selects the data contained in the data transfer
                mimeTypes.forEach((mime) => {
                    const value = e.dataTransfer.getData(mime);
                    if (value !== '') {
                        data[mime] = value;
                    }
                });
                return !onDrop({ effect, data }, e);
            }
            return undefined;
        });
    }
    static getInstance() {
        if (!DnDUtils.instance) {
            DnDUtils.instance = new DnDUtils();
        }
        return DnDUtils.instance;
    }
}
//# sourceMappingURL=DndUtils.js.map