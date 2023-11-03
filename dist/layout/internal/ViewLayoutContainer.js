import { LayoutContainerEvents } from '../interfaces';
import { ALayoutContainer } from './ALayoutContainer';
import { Dropper } from './Dropper';
export class HTMLView {
    constructor(html, doc) {
        this.minSize = [0, 0];
        this.visible = true;
        // HTML
        this.node = doc.createElement('div');
        this.node.innerHTML = html;
    }
    destroy() {
        // nothing to do
    }
    resized() {
        // nothing to do
    }
    dumpReference() {
        return -1;
    }
}
export class NodeView {
    constructor(node) {
        this.node = node;
        this.minSize = [0, 0];
        this.visible = true;
    }
    destroy() {
        // nothing to do
    }
    resized() {
        // nothing to do
    }
    dumpReference() {
        return -1;
    }
}
export class ViewLayoutContainer extends ALayoutContainer {
    constructor(view, options) {
        super(view.node.ownerDocument, options);
        this.view = view;
        this.type = 'view';
        this.node = view.node.ownerDocument.createElement('article');
        this.node.dataset.layout = 'view';
        this.node.appendChild(view.node);
        // TODO: The expand view is broken currently, therefore we hide it temporarily.
        this.header.insertAdjacentHTML('beforeend', `<button type="button" title="Expand view" class="size-toggle invisible" aria-label="Toggle View Size"><span><i class="fas fa-expand"></i></span></button>`);
        const min = this.minSize;
        if (min[0] > 0) {
            view.node.style.minWidth = `${min[0]}px`;
        }
        if (min[1] > 0) {
            view.node.style.minHeight = `${min[1]}px`;
        }
        if (!this.options.fixedLayout) {
            Dropper.dropViews(this.node, this);
        }
        this.updateTitle();
        this.header.querySelector('.size-toggle').addEventListener('click', () => this.toggleMaximizedView());
        this.header.addEventListener('dblclick', () => this.toggleMaximizedView());
    }
    defaultOptions() {
        return Object.assign(super.defaultOptions(), {
            hideHeader: false,
        });
    }
    get hideAbleHeader() {
        return this.options.hideHeader;
    }
    get visible() {
        return this.view.visible;
    }
    set visible(visible) {
        this.fire(ALayoutContainer.withChanged(LayoutContainerEvents.EVENT_VISIBILITY_CHANGED), this.view.visible, (this.view.visible = visible));
    }
    get minSize() {
        return this.view.minSize ? this.view.minSize : [0, 0];
    }
    resized() {
        if (this.view.resized) {
            this.view.resized();
        }
    }
    destroy() {
        super.destroy();
        if (this.parent) {
            this.parent.remove(this);
        }
        this.view.destroy();
    }
    persist() {
        const r = Object.assign(super.persist(), {
            type: 'view',
        });
        if (this.view instanceof HTMLView) {
            r.html = this.view.node.innerHTML;
        }
        else {
            r.view = this.view.dumpReference();
        }
        return r;
    }
    static restore(dump, restoreView, doc) {
        const view = dump.html ? new HTMLView(dump.html, doc) : restoreView(dump.view);
        return new ViewLayoutContainer(view, ALayoutContainer.restoreOptions(dump));
    }
    static derive(view) {
        return new ViewLayoutContainer(view, ALayoutContainer.deriveOptions(view.node));
    }
}
//# sourceMappingURL=ViewLayoutContainer.js.map