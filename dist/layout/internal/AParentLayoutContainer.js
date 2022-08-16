import { LayoutContainerEvents } from '../interfaces';
import { ALayoutContainer } from './ALayoutContainer';
export class AParentLayoutContainer extends ALayoutContainer {
    constructor(document, options) {
        super(document, options);
        this._children = [];
        this._visible = false;
        this.node = document.createElement('main');
        this.node.classList.add('phovea-layout');
    }
    canDrop(area) {
        return false;
    }
    get rootParent() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let p = this;
        while (p.parent !== null) {
            p = p.parent;
        }
        return p;
    }
    forEach(callback) {
        this._children.forEach(callback);
    }
    get children() {
        return this._children.slice();
    }
    [Symbol.iterator]() {
        return this._children[Symbol.iterator]();
    }
    get length() {
        return this._children.length;
    }
    get visible() {
        return this._visible;
    }
    set visible(visible) {
        if (this._visible === visible) {
            return;
        }
        this.fire(ALayoutContainer.withChanged(LayoutContainerEvents.EVENT_VISIBILITY_CHANGED), this._visible, (this._visible = visible));
        this.visibilityChanged(visible);
    }
    visibilityChanged(visible) {
        this.forEach((c) => (c.visible = visible));
    }
    push(child, index = -1) {
        this.setupChild(child);
        if (index >= this._children.length || index < 0) {
            index = this._children.length;
            this._children.push(child);
        }
        else {
            this._children.splice(index, 0, child);
        }
        this.addedChild(child, index);
        return true;
    }
    setupChild(child) {
        if (child.parent) {
            child.parent.remove(child);
        }
        child.parent = this;
    }
    addedChild(child, index) {
        child.resized();
        this.propagate(child, LayoutContainerEvents.EVENT_LAYOUT_CHANGED, LayoutContainerEvents.EVENT_MAXIMIZE, LayoutContainerEvents.EVENT_RESTORE_SIZE);
        this.fire(ALayoutContainer.withChanged(LayoutContainerEvents.EVENT_CHILD_ADDED), child, index);
    }
    replace(child, replacement) {
        const index = this._children.indexOf(child);
        console.assert(index >= 0);
        this.takeDownChild(child);
        this.fire(ALayoutContainer.withChanged(LayoutContainerEvents.EVENT_CHILD_REMOVED), child);
        this.setupChild(replacement);
        this._children.splice(index, 1, replacement);
        this.addedChild(replacement, index);
        return true;
    }
    remove(child) {
        this.takeDownChild(child);
        this._children.splice(this._children.indexOf(child), 1);
        if (this.minChildCount > this.length && this.parent) {
            if (this.length > 1) {
                // remove and inline my children (just one since the remove will be called again
                this.parent.push(this._children[1]);
            }
            else if (this.length > 0) {
                this.parent.replace(this, this._children[0]);
            }
            else {
                this.parent.remove(this);
            }
        }
        this.fire(ALayoutContainer.withChanged(LayoutContainerEvents.EVENT_CHILD_REMOVED), child);
        return true;
    }
    clear() {
        if (this.length === 0) {
            return;
        }
        this._children.forEach((old) => this.takeDownChild(old));
        this._children.splice(0, this._children.length);
        if (this.minChildCount > this.length && this.parent) {
            this.parent.remove(this);
        }
        this.fire(ALayoutContainer.withChanged(LayoutContainerEvents.EVENT_CHILD_REMOVED));
    }
    takeDownChild(child) {
        this.stopPropagation(child, LayoutContainerEvents.EVENT_LAYOUT_CHANGED, LayoutContainerEvents.EVENT_MAXIMIZE, LayoutContainerEvents.EVENT_RESTORE_SIZE);
        child.visible = false;
        child.parent = null;
    }
    resized() {
        this.forEach((d) => d.resized());
    }
    destroy() {
        super.destroy();
        if (this.parent) {
            this.parent.remove(this);
        }
        this.forEach((d) => d.destroy());
    }
    persist() {
        return Object.assign(super.persist(), {
            children: this._children.map((d) => d.persist()),
        });
    }
    find(id) {
        if (super.find(id) != null) {
            return this;
        }
        for (const child of this._children) {
            const r = child.find(id);
            if (r != null) {
                return r;
            }
        }
        return null;
    }
    findAll(predicate) {
        const base = super.findAll(predicate);
        return base.concat(...this._children.map((d) => d.findAll(predicate)));
    }
}
//# sourceMappingURL=AParentLayoutContainer.js.map