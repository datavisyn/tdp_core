import { EOrientation } from './interfaces';
import { ViewLayoutContainer, HTMLView, NodeView } from './internal/ViewLayoutContainer';
import { SplitLayoutContainer } from './internal/SplitLayoutContainer';
import { LineUpLayoutContainer } from './internal/LineUpLayoutContainer';
import { TabbingLayoutContainer } from './internal/TabbingLayoutContainer';
import { RootLayoutContainer } from './internal/RootLayoutContainer';
export class ABuilder {
    constructor() {
        this._name = 'View';
        this._fixed = false;
        this._autoWrap = false;
        this._fixedLayout = false;
    }
    /**
     * specify the name of the view
     * @param {string} name the new name
     * @return {this} itself
     */
    name(name) {
        this._name = name;
        return this;
    }
    /**
     * specify that the view cannot be closed and the view and separators cannot be moved via drag and drop
     * setting the fixed option implies the fixedLayout option
     * @return {this} itself
     */
    fixed() {
        this._fixed = true;
        this._fixedLayout = true;
        return this;
    }
    /**
     * specify that drag and drop is disabled for views, but the separator can still be moved
     * @returns {this}
     */
    fixedLayout() {
        this._fixedLayout = true;
        return this;
    }
    /**
     * specify that the view should be automatically wrapped with a tabbing container in case of a new split
     * @return {this} itself
     */
    autoWrap(name) {
        this._autoWrap = name !== undefined ? name : true;
        return this;
    }
    buildOptions() {
        return {
            name: this._name,
            fixed: this._fixed,
            autoWrap: this._autoWrap,
            fixedLayout: this._fixedLayout,
        };
    }
}
export class ViewBuilder extends ABuilder {
    constructor(view) {
        super();
        this.view = view;
        this._hideHeader = false;
    }
    hideHeader() {
        this._hideHeader = true;
        this._fixed = true;
        return this;
    }
    buildOptions() {
        return { hideHeader: this._hideHeader, ...super.buildOptions() };
    }
    build(root, doc) {
        const options = this.buildOptions();
        if (typeof this.view === 'string') {
            return new ViewLayoutContainer(new HTMLView(this.view, doc), options);
        }
        if (this.view.nodeName !== undefined) {
            return new ViewLayoutContainer(new NodeView(this.view), options);
        }
        return new ViewLayoutContainer(this.view, options);
    }
}
class LayoutUtils {
    /**
     * restores the given layout dump
     * @param {ILayoutDump} dump the dump
     * @param {(referenceId: number) => PHOVEA_UI_IView} restoreView lookup function for getting the underlying view given the dumped reference id
     * @param {Document} doc root document
     * @return {ILayoutContainer} the root element
     */
    static restore(dump, restoreView, doc = document) {
        const restorer = (d) => LayoutUtils.restore(d, restoreView, doc);
        switch (dump.type) {
            case 'root':
                return RootLayoutContainer.restore(dump, doc, (r, child) => this.toBuilder(child).build(r, doc), (d, resView) => LayoutUtils.restore(d, resView, doc), restoreView);
            case 'split':
                return SplitLayoutContainer.restore(dump, restorer, doc);
            case 'lineup':
                return LineUpLayoutContainer.restore(dump, restorer, doc);
            case 'tabbing':
                return TabbingLayoutContainer.restore(dump, restorer, doc);
            case 'view':
                return ViewLayoutContainer.restore(dump, restoreView, doc);
            default:
                throw new Error(`invalid type: ${dump.type}`);
        }
    }
    /**
     * derives from an existing html scaffolded layout the phovea layout and replaced the nodes with it
     * @param {HTMLElement} node the root node
     * @param {(node: HTMLElement) => PHOVEA_UI_IView} viewFactory how to build a view from a node
     */
    static derive(node, viewFactory = (n) => new NodeView(n)) {
        const doc = node.ownerDocument;
        const r = new RootLayoutContainer(doc, (child) => this.toBuilder(child).build(r, doc), (dump, restoreView) => LayoutUtils.restore(dump, restoreView, doc));
        const deriveImpl = (n) => {
            switch (n.dataset.layout || 'view') {
                case 'hsplit':
                case 'vsplit':
                case 'split':
                    return SplitLayoutContainer.derive(n, deriveImpl);
                case 'lineup':
                case 'vlineup':
                case 'hlineup':
                case 'stack':
                case 'hstack':
                case 'vstack':
                    return LineUpLayoutContainer.derive(n, deriveImpl);
                case 'tabbing':
                    return TabbingLayoutContainer.derive(n, deriveImpl);
                default:
                    // interpret as view
                    return ViewLayoutContainer.derive(viewFactory(n) || new NodeView(n));
            }
        };
        r.root = deriveImpl(node);
        if (node.parentElement) {
            // replace old node with new root
            node.parentElement.replaceChild(r.node, node);
        }
        return r;
    }
    static toBuilder(view) {
        if (view instanceof ABuilder) {
            return view;
        }
        return new ViewBuilder(view);
    }
    /* phovea_core */
    static padding(v) {
        return { top: v, left: v, right: v, bottom: v };
    }
    static flowLayout(horizontal, gap, padding = { top: 0, left: 0, right: 0, bottom: 0 }) {
        function getSize(w, h, child, value) {
            if (horizontal) {
                return [value, LayoutUtils.grab(child.layoutOption('prefHeight', Number.NaN), h)];
            }
            return [LayoutUtils.grab(child.layoutOption('prefWidth', Number.NaN), w), value];
        }
        function FlowLayout(elems, w, h, parent) {
            w -= padding.left + padding.right;
            h -= padding.top + padding.bottom;
            const freeSpace = (horizontal ? w : h) - gap * (elems.length - 1);
            let unbound = 0;
            let fixUsed = 0;
            let ratioSum = 0;
            // count statistics
            elems.forEach((elem) => {
                const fix = elem.layoutOption(horizontal ? 'prefWidth' : 'prefHeight', Number.NaN);
                const ratio = elem.layoutOption('ratio', Number.NaN);
                if (LayoutUtils.isDefault(fix) && LayoutUtils.isDefault(ratio)) {
                    unbound++;
                }
                else if (fix >= 0) {
                    fixUsed += fix;
                }
                else {
                    ratioSum += ratio;
                }
            });
            const ratioMax = ratioSum < 1 ? 1 : ratioSum;
            const unboundedSpace = (freeSpace - fixUsed - (freeSpace * ratioSum) / ratioMax) / unbound;
            // set all sizes
            const sizes = elems.map((elem) => {
                const fix = elem.layoutOption(horizontal ? 'prefWidth' : 'prefHeight', Number.NaN);
                const ratio = elem.layoutOption('ratio', Number.NaN);
                if (LayoutUtils.isDefault(fix) && LayoutUtils.isDefault(ratio)) {
                    return getSize(w, h, elem, unboundedSpace);
                }
                if (fix >= 0) {
                    return getSize(w, h, elem, fix);
                } // (ratio > 0)
                const value = (ratio / ratioMax) * freeSpace;
                return getSize(w, h, elem, value);
            });
            // set all locations
            let xAccumulator = padding.left;
            let yAccumulator = padding.top;
            const promises = [];
            elems.forEach((elem, i) => {
                const s = sizes[i];
                promises.push(elem.setBounds(xAccumulator, yAccumulator, s[0], s[1]));
                if (horizontal) {
                    xAccumulator += s[0] + gap;
                }
                else {
                    yAccumulator += s[1] + gap;
                }
            });
            return LayoutUtils.waitFor(promises);
        }
        return FlowLayout;
    }
    static distributeLayout(horizontal, defaultValue, padding = LayoutUtils.noPadding) {
        function setBounds(x, y, w, h, child, value) {
            if (horizontal) {
                return child.setBounds(x, y, value, LayoutUtils.grab(child.layoutOption('prefHeight', Number.NaN), h));
            }
            return child.setBounds(x, y, LayoutUtils.grab(child.layoutOption('prefWidth', Number.NaN), w), value);
        }
        function DistributeLayout(elems, w, h, parent) {
            w -= padding.left + padding.right;
            h -= padding.top + padding.bottom;
            const freeSpace = horizontal ? w : h;
            let fixUsed = 0;
            // count statistics
            elems.forEach((elem) => {
                let fix = elem.layoutOption(horizontal ? 'prefWidth' : 'prefHeight', Number.NaN);
                if (LayoutUtils.isDefault(fix)) {
                    fix = defaultValue;
                }
                fixUsed += fix;
            });
            const gap = (freeSpace - fixUsed) / (elems.length - 1);
            let xAccumulator = padding.left;
            let yAccumulator = padding.top;
            if (elems.length === 1) {
                // center the single one
                if (horizontal) {
                    xAccumulator += (freeSpace - fixUsed) / 2;
                }
                else {
                    yAccumulator += (freeSpace - fixUsed) / 2;
                }
            }
            const promises = [];
            elems.forEach((elem) => {
                let fix = elem.layoutOption(horizontal ? 'prefWidth' : 'prefHeight', Number.NaN);
                if (LayoutUtils.isDefault(fix)) {
                    fix = defaultValue;
                }
                promises.push(setBounds(xAccumulator, yAccumulator, w, h, elem, fix));
                if (horizontal) {
                    xAccumulator += fix + gap;
                }
                else {
                    yAccumulator += fix + gap;
                }
            });
            return LayoutUtils.waitFor(promises);
        }
        return DistributeLayout;
    }
    //     top
    //------------
    // l |      | r
    // e |      | i
    // f |center| g
    // t |      | h
    //   |      | t
    //-------------
    //   bottom
    static borderLayout(horizontal, gap, percentages = {
        top: 0.2,
        left: 0.2,
        right: 0.2,
        bottom: 0.2,
    }, padding = LayoutUtils.noPadding) {
        function BorderLayout(elems, w, h, parent) {
            w -= padding.left + padding.right;
            h -= padding.top + padding.bottom;
            let x = padding.top;
            let y = padding.left;
            let wc = w;
            let hc = h;
            const pos = new Map();
            pos.set('top', []);
            pos.set('center', []);
            pos.set('left', []);
            pos.set('right', []);
            pos.set('bottom', []);
            elems.forEach((elem) => {
                let border = elem.layoutOption('border', 'center');
                if (!pos.has(border)) {
                    border = 'center'; // invalid one
                }
                pos.get(border).push(elem);
            });
            const promises = [];
            if (pos.get('top').length > 0) {
                y += h * percentages.top;
                hc -= h * percentages.top;
                promises.push(LayoutUtils.flowLayout(true, gap)(pos.get('top'), w, h * percentages.top, parent));
            }
            if (pos.get('bottom').length > 0) {
                hc -= h * percentages.bottom;
                promises.push(LayoutUtils.flowLayout(true, gap)(pos.get('bottom'), w, h * percentages.bottom, parent));
            }
            if (pos.get('left').length > 0) {
                x += w * percentages.left;
                wc -= w * percentages.left;
                promises.push(LayoutUtils.flowLayout(false, gap)(pos.get('left'), w * percentages.left, hc, parent));
            }
            if (pos.get('right').length > 0) {
                wc -= w * percentages.right;
                promises.push(LayoutUtils.flowLayout(false, gap)(pos.get('right'), w * percentages.right, hc, parent));
            }
            if (pos.get('center').length > 0) {
                promises.push(LayoutUtils.flowLayout(true, gap)(pos.get('center'), wc, hc, parent));
            }
            return LayoutUtils.waitFor(promises);
        }
        return BorderLayout;
    }
    static layers(elems, w, h, parent) {
        return LayoutUtils.waitFor(elems.map((elem) => {
            const x = LayoutUtils.grab(elem.layoutOption('prefX', Number.NaN), 0);
            const y = LayoutUtils.grab(elem.layoutOption('prefY', Number.NaN), 0);
            return elem.setBounds(x, y, w - x, h - y);
        }));
    }
    static waitFor(promises, redo = false) {
        promises = promises.filter((p) => p != null);
        if (promises.length === 0) {
            return Promise.resolve(redo);
        }
        if (promises.length === 1) {
            return promises[0].then(() => redo);
        }
        return Promise.all(promises).then(() => redo);
    }
    static grab(definition, v) {
        return LayoutUtils.isDefault(definition) ? v : definition;
    }
    static isDefault(v) {
        return v < 0 || Number.isNaN(v);
    }
}
LayoutUtils.noPadding = LayoutUtils.padding(0);
export { LayoutUtils };
export class AParentBuilder extends ABuilder {
    constructor(children) {
        super();
        this.children = [];
        this._name = '';
        children.forEach((c) => this.push(c));
    }
    push(view) {
        this.children.push(LayoutUtils.toBuilder(view));
        return this;
    }
    buildChildren(root, doc) {
        return this.children.map((c) => c.build(root, doc));
    }
}
export class SplitBuilder extends AParentBuilder {
    constructor(orientation, ratio, left, right) {
        super([left, right]);
        this.orientation = orientation;
        this._ratio = 0.5;
        this._ratio = ratio;
    }
    /**
     * set the ratio between the left and right view
     * @param {number} ratio the new ratio
     * @return {SplitBuilder} itself
     */
    ratio(ratio) {
        this._ratio = ratio;
        return this;
    }
    buildOptions() {
        return { orientation: this.orientation, ...super.buildOptions() };
    }
    build(root, doc = document) {
        const built = this.buildChildren(root, doc);
        console.assert(built.length >= 2);
        const r = new SplitLayoutContainer(doc, this.buildOptions(), this._ratio, built[0], built[1]);
        built.slice(2).forEach((c) => r.push(c));
        return r;
    }
}
class LineUpBuilder extends AParentBuilder {
    constructor(orientation, children, stackLayout = false) {
        super(children);
        this.orientation = orientation;
        this.stackLayout = stackLayout;
    }
    /**
     * push another child
     * @param {IBuildAbleOrViewLike} view the view to add
     * @return {LineUpBuilder} itself
     */
    push(view) {
        return super.push(view);
    }
    buildOptions() {
        return { orientation: this.orientation, stackLayout: this.stackLayout, ...super.buildOptions() };
    }
    build(root, doc = document) {
        const built = this.buildChildren(root, doc);
        return new LineUpLayoutContainer(doc, this.buildOptions(), ...built);
    }
}
class TabbingBuilder extends AParentBuilder {
    constructor() {
        super(...arguments);
        this._active = null;
    }
    /**
     * push another tab
     * @param {IBuildAbleOrViewLike} view the tab
     * @return {TabbingBuilder} itself
     */
    push(view) {
        return super.push(view);
    }
    /**
     * adds another child and specify it should be the active one
     * @param {IBuildAbleOrViewLike} view the active tab
     * @return {AParentBuilder} itself
     */
    active(view) {
        this._active = this.children.length;
        return super.push(view);
    }
    buildOptions() {
        return { active: this._active, ...super.buildOptions() };
    }
    build(root, doc) {
        const built = this.buildChildren(root, doc);
        return new TabbingLayoutContainer(doc, this.buildOptions(), ...built);
    }
}
export class BuilderUtils {
    /**
     * builder for creating a view
     * @param {string | PHOVEA_UI_IView} view possible view content
     * @return {ViewBuilder} a view builder
     */
    static view(view) {
        return new ViewBuilder(view);
    }
    /**
     * creates the root of a new layout
     * @param {IBuildAbleOrViewLike} child the only child of the root
     * @param {Document} doc root Document
     * @return {IRootLayoutContainer} the root element
     */
    static root(child, doc = document) {
        const b = LayoutUtils.toBuilder(child);
        const r = new RootLayoutContainer(doc, (c) => LayoutUtils.toBuilder(c).build(r, doc), (dump, restoreView) => LayoutUtils.restore(dump, restoreView, doc));
        r.root = b.build(r, doc);
        return r;
    }
    /**
     * builder for creating a horizontal split layout (moveable splitter)
     * @param {number} ratio ratio between the two given elements
     * @param {IBuildAbleOrViewLike} left left container
     * @param {IBuildAbleOrViewLike} right right container
     * @return {SplitBuilder} a split builder
     */
    static horizontalSplit(ratio, left, right) {
        return new SplitBuilder(EOrientation.HORIZONTAL, ratio, left, right);
    }
    /**
     * builder for creating a vertical split layout (moveable splitter)
     * @param {number} ratio ratio between the two given elements
     * @param {IBuildAbleOrViewLike} left left container
     * @param {IBuildAbleOrViewLike} right right container
     * @return {SplitBuilder} a split builder
     */
    static verticalSplit(ratio, left, right) {
        return new SplitBuilder(EOrientation.VERTICAL, ratio, left, right);
    }
    /**
     * builder for creating a horizontal lineup layout (each container has the same full size with scrollbars)
     * @param {IBuildAbleOrViewLike} children the children of the layout
     * @return {LineUpBuilder} a lineup builder
     */
    static horizontalLineUp(...children) {
        return new LineUpBuilder(EOrientation.HORIZONTAL, children);
    }
    /**
     * builder for creating a vertical lineup layout (each container has the same full size with scrollbars)
     * @param {IBuildAbleOrViewLike} children the children of the layout
     * @return {LineUpBuilder} a lineup builder
     */
    static verticalLineUp(...children) {
        return new LineUpBuilder(EOrientation.VERTICAL, children);
    }
    /**
     * similar to the horizontalLineUp, except that each container takes its own amount of space
     * @param {IBuildAbleOrViewLike} children the children of the layout
     * @return {LineUpBuilder} a lineup builder
     */
    static horizontalStackedLineUp(...children) {
        return new LineUpBuilder(EOrientation.HORIZONTAL, children, true);
    }
    /**
     * similar to the verticalLineUp, except that each container takes its own amount of space
     * @param {IBuildAbleOrViewLike} children the children of the layout
     * @return {LineUpBuilder} a lineup builder
     */
    static verticalStackedLineUp(...children) {
        return new LineUpBuilder(EOrientation.VERTICAL, children, true);
    }
    /**
     * builder for creating a tab layout
     * @param {IBuildAbleOrViewLike} children the children of the layout
     * @return {TabbingBuilder} a tabbing builder
     */
    static tabbing(...children) {
        return new TabbingBuilder(children);
    }
}
//# sourceMappingURL=builder.js.map