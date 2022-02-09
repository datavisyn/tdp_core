import { EOrientation } from '../interfaces';
import { ALayoutContainer } from './ALayoutContainer';
import { ASequentialLayoutContainer } from './ASequentialLayoutContainer';
export class LineUpLayoutContainer extends ASequentialLayoutContainer {
    constructor(document, options, ...children) {
        super(document, options);
        this.minChildCount = 1;
        this.type = 'lineup';
        this.node.dataset.layout = 'lineup';
        if (this.options.stackLayout) {
            this.node.dataset.mode = 'stacked';
        }
        children.forEach((d) => this.push(d));
    }
    place(child, reference, area) {
        console.assert(area !== 'center');
        const index = this._children.indexOf(reference) + (area === 'right' || area === 'bottom' ? 1 : 0);
        return this.push(child, index);
    }
    addedChild(child, index) {
        super.addedChild(child, index);
        if (index < 0 || index >= this._children.length - 1) {
            // +1 since we already chanded the children
            this.node.appendChild(ASequentialLayoutContainer.wrap(child));
        }
        else {
            this.node.insertBefore(ASequentialLayoutContainer.wrap(child), this.node.children[index]);
        }
        if (this.options.stackLayout) {
            if (this.options.orientation === EOrientation.HORIZONTAL) {
                child.node.parentElement.style.minWidth = child.minSize[0] > 0 ? `${child.minSize[0]}px` : null; // set minSize if available or delete CSS property
            }
            else {
                child.node.parentElement.style.minHeight = child.minSize[1] > 0 ? `${child.minSize[1]}px` : null;
            }
        }
        child.visible = this.visible;
    }
    takeDownChild(child) {
        this.node.removeChild(child.node.parentElement);
        this.node.dataset.mode = '';
        super.takeDownChild(child);
    }
    persist() {
        return Object.assign(super.persist(), {
            type: 'lineup',
            stackLayout: this.options.stackLayout,
        });
    }
    static restore(dump, restore, doc) {
        const options = Object.assign(ALayoutContainer.restoreOptions(dump), {
            orientation: EOrientation[dump.orientation],
            stackLayout: dump.stackLayout,
        });
        const r = new LineUpLayoutContainer(doc, options);
        dump.children.forEach((d) => r.push(restore(d)));
        return r;
    }
    static derive(node, derive) {
        const children = Array.from(node.children);
        console.assert(children.length >= 1);
        const deriveOrientation = () => {
            if (node.dataset.layout.startsWith('v') || (node.dataset.orientation && node.dataset.orientation.startsWith('v'))) {
                return EOrientation.VERTICAL;
            }
            return EOrientation.HORIZONTAL;
        };
        const options = Object.assign(ALayoutContainer.deriveOptions(node), {
            orientation: deriveOrientation(),
            stackLayout: node.dataset.mode === 'stacked' || node.dataset.layout.endsWith('stack'),
        });
        const r = new LineUpLayoutContainer(node.ownerDocument, options);
        children.forEach((c) => r.push(derive(c)));
        return r;
    }
    defaultOptions() {
        return Object.assign(super.defaultOptions(), {
            stackLayout: false,
        });
    }
}
//# sourceMappingURL=LineUpLayoutContainer.js.map