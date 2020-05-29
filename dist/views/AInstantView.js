export class AInstantView {
    constructor(selection, options) {
        this.selection = selection;
        this.node = options.document.createElement('article');
        this.node.classList.add('tdp-instant-view');
        this.initImpl();
    }
    initImpl() {
        // hook
    }
    destroy() {
        this.node.remove();
    }
}
//# sourceMappingURL=AInstantView.js.map