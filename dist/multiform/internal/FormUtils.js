export class FormUtils {
    /**
     * @internal
     */
    static selectVis(initial, visses) {
        switch (typeof initial) {
            case 'number':
                return visses[Math.max(0, Math.min(initial, visses.length - 1))];
            case 'string':
                return visses[Math.max(0, visses.findIndex((v) => v.id === initial))];
            default:
                return visses[Math.max(0, visses.indexOf(initial))];
        }
    }
    /**
     * @internal
     */
    static clearNode(parent) {
        let node = parent.firstChild;
        while ((node = parent.firstChild) != null) {
            parent.removeChild(node);
        }
    }
    /**
     * @internal
     */
    static createNode(parent, type = 'div', clazz) {
        const node = parent.ownerDocument.createElement(type);
        if (clazz) {
            clazz.split(' ').forEach((c) => node.classList.add(c));
        }
        parent.appendChild(node);
        return node;
    }
}
//# sourceMappingURL=FormUtils.js.map