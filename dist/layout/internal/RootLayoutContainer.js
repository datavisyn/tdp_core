import { AParentLayoutContainer } from './AParentLayoutContainer';
import { LayoutContainerEvents } from '../interfaces';
import { TabbingLayoutContainer } from './TabbingLayoutContainer';
export class RootLayoutContainer extends AParentLayoutContainer {
    constructor(document, build, restorer) {
        super(document, {
            name: '',
            fixed: true,
        });
        this.build = build;
        this.restorer = restorer;
        this.minChildCount = 0;
        this.type = 'root';
        this.viewDump = null;
        this.node.dataset.layout = 'root';
        this.visible = true;
        this.on(LayoutContainerEvents.EVENT_MAXIMIZE, (_evt, view) => {
            const section = this.node.ownerDocument.createElement('section');
            section.classList.add('maximized-view');
            this.viewDump = {
                parent: {
                    viewParent: view.node.parentElement,
                    headerParent: view.header.parentElement,
                },
                sibling: {
                    viewSibling: view.node.nextElementSibling,
                    headerSibling: view.header.nextElementSibling,
                },
            };
            section.appendChild(view.header);
            section.appendChild(view.node);
            this.node.insertAdjacentElement('afterbegin', section);
            view.resized();
        });
        this.on(LayoutContainerEvents.EVENT_RESTORE_SIZE, (_evt, view) => {
            if (!this.viewDump) {
                return;
            }
            this.viewDump.parent.viewParent.insertBefore(view.node, this.viewDump.sibling.viewSibling);
            this.viewDump.parent.headerParent.insertBefore(view.header, this.viewDump.sibling.headerSibling);
            this.viewDump = null;
            this.node.querySelector('.maximized-view').remove();
            view.resized();
        });
    }
    set root(root) {
        if (this._children.length > 0) {
            this.replace(this.root, root);
        }
        else {
            this.push(root);
        }
    }
    get root() {
        return this._children[0];
    }
    get minSize() {
        return this._children[0].minSize;
    }
    addedChild(child, index) {
        super.addedChild(child, index);
        if (child instanceof TabbingLayoutContainer) {
            // need the header
            this.node.appendChild(child.header);
        }
        this.node.appendChild(child.node);
        child.visible = this.visible;
    }
    place(child, reference, area) {
        return this.push(child);
    }
    takeDownChild(child) {
        if (child instanceof TabbingLayoutContainer) {
            this.node.removeChild(child.header);
        }
        this.node.removeChild(child.node);
        super.takeDownChild(child);
    }
    restore(dump, restoreView) {
        console.assert(dump.type === 'root');
        this.clear();
        const children = (dump.children || []).map((d) => this.restorer(d, restoreView));
        if (children.length === 0) {
            return;
        }
        this.root = children[0];
        children.slice(1).forEach((c) => this.push(c));
    }
    persist() {
        return Object.assign(super.persist(), {
            type: 'root',
        });
    }
    static restore(dump, doc, build, restorer, restoreView) {
        const r = new RootLayoutContainer(doc, (layout) => build(r, layout), restorer);
        r.restore(dump, restoreView);
        return r;
    }
}
//# sourceMappingURL=RootLayoutContainer.js.map