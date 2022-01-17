import { AParentLayoutContainer } from './AParentLayoutContainer';
import { EOrientation } from '../interfaces';
import { LAYOUT_CONTAINER_WRAPPER } from '../constants';
export class ASequentialLayoutContainer extends AParentLayoutContainer {
    constructor(document, options) {
        super(document, options);
        this.node.dataset.layout = 'sequence';
        this.node.dataset.orientation = this.options.orientation === EOrientation.HORIZONTAL ? 'h' : 'v';
    }
    canDrop(area) {
        return this.options.orientation === EOrientation.HORIZONTAL
            ? area === 'left' || area === 'right' || area === 'horizontal-scroll'
            : area === 'top' || area === 'bottom' || area === 'vertical-scroll';
    }
    defaultOptions() {
        return Object.assign(super.defaultOptions(), {
            orientation: EOrientation.HORIZONTAL,
        });
    }
    get hideAbleHeader() {
        return this.options.fixedLayout;
    }
    getPadding() {
        return 0;
    }
    get minSize() {
        console.assert(this.length >= 1);
        const padding = this.getPadding();
        switch (this.options.orientation) {
            case EOrientation.HORIZONTAL:
                return this._children.reduce((a, c) => {
                    const cmin = c.minSize;
                    return [a[0] + cmin[0], Math.max(a[1], cmin[1])];
                }, [padding, 0]);
            case EOrientation.VERTICAL: {
                return this._children.reduce((a, c) => {
                    const cmin = c.minSize;
                    return [Math.max(a[0], cmin[0]), a[1] + cmin[1]];
                }, [0, padding]);
            }
            default:
                return undefined;
        }
    }
    persist() {
        return Object.assign(super.persist(), {
            type: 'sequence',
            orientation: EOrientation[this.options.orientation],
        });
    }
    static wrap(child) {
        const s = child.node.ownerDocument.createElement('section');
        s.classList.add(LAYOUT_CONTAINER_WRAPPER);
        if (!child.hideAbleHeader) {
            s.appendChild(child.header);
        }
        s.appendChild(child.node);
        return s;
    }
}
//# sourceMappingURL=ASequentialLayoutContainer.js.map