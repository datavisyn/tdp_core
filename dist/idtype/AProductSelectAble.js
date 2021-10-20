import { ParseRangeUtils } from '../range';
import { SelectOperation, SelectionUtils } from './SelectionUtils';
import { ASelectAble } from './ASelectAble';
import { ProductIDType } from './ProductIDType';
export class AProductSelectAble extends ASelectAble {
    constructor() {
        super(...arguments);
        this.numProductSelectListeners = 0;
        this.productSelectionListener = (event, index, type) => {
            const cells = this.producttype.productSelections(type);
            if (cells.length === 0) {
                this.fire(ProductIDType.EVENT_SELECT_PRODUCT, type, []);
                this.fire(`${ProductIDType.EVENT_SELECT_PRODUCT}-${type}`, []);
                return;
            }
            this.ids().then((ids) => {
                const act = cells.map((c) => ids.indexOf(c)).filter((c) => !c.isNone);
                if (act.length === 0) {
                    return;
                }
                //ensure the right number of dimensions
                act.forEach((a) => SelectionUtils.fillWithNone(a, ids.ndim));
                this.fire(ProductIDType.EVENT_SELECT_PRODUCT, type, act);
                this.fire(`${ProductIDType.EVENT_SELECT_PRODUCT}-${type}`, act);
            });
        };
    }
    on(events, handler) {
        if (typeof events === 'string' && (events === 'select' || events === 'selectProduct' || events.slice(0, 'select-'.length) === 'select-')) {
            this.numProductSelectListeners++;
            if (this.numProductSelectListeners === 1) {
                this.producttype.on('selectProduct', this.productSelectionListener);
            }
        }
        return super.on(events, handler);
    }
    off(events, handler) {
        if (typeof events === 'string' && (events === 'select' || events === 'selectProduct' || events.slice(0, 'select-'.length) === 'select-')) {
            this.numProductSelectListeners--;
            if (this.numProductSelectListeners === 0) {
                this.producttype.off('selectProduct', this.productSelectionListener);
            }
        }
        return super.off(events, handler);
    }
    productSelections(type = SelectionUtils.defaultSelectionType) {
        return this.ids().then((ids) => {
            const cells = this.producttype.productSelections(type);
            const act = cells.map((c) => ids.indexRangeOf(c)).filter((c) => !c.isNone);
            //ensure the right number of dimensions
            act.forEach((a) => SelectionUtils.fillWithNone(a, ids.ndim));
            return act;
        });
    }
    selectProduct() {
        const a = Array.from(arguments);
        const type = (typeof a[0] === 'string') ? a.shift() : SelectionUtils.defaultSelectionType, range = a[0].map(ParseRangeUtils.parseRangeLike), op = SelectionUtils.asSelectOperation(a[1]);
        return this.selectProductImpl(range, op, type);
    }
    selectProductImpl(cells, op = SelectOperation.SET, type = SelectionUtils.defaultSelectionType) {
        return this.ids().then((ids) => {
            cells = cells.map((c) => ids.preMultiply(c));
            return this.producttype.select(type, cells, op);
        });
    }
    clear() {
        const a = Array.from(arguments);
        if (typeof a[0] === 'number') {
            a.shift();
        }
        const type = (typeof a[0] === 'string') ? a[0] : SelectionUtils.defaultSelectionType;
        return this.selectProductImpl([], SelectOperation.SET, type || SelectionUtils.defaultSelectionType);
    }
}
//# sourceMappingURL=AProductSelectAble.js.map