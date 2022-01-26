import { EventHandler } from '../base/event';
import { SelectOperation, SelectionUtils } from './SelectionUtils';
import { IDType } from './IDType';
export class ASelectAble extends EventHandler {
    constructor() {
        super(...arguments);
        this.numSelectListeners = 0;
        this.selectionListeners = [];
        this.singleSelectionListener = async (event, type, act, added, removed) => {
            const ids = Array.from(await this.ids());
            //filter to the right ids and convert to indices format
            //given all ids convert the selected ids to the indices in the data type
            act = act.map((id) => ids.indexOf(id));
            added = added.map((id) => ids.indexOf(id));
            removed = removed.map((id) => ids.indexOf(id));
            if (act.length === 0 && added.length === 0 && removed.length === 0) {
                return;
            }
            this.fire(ASelectAble.EVENT_SELECT, type, act, added, removed);
            this.fire(`${ASelectAble.EVENT_SELECT}-${type}`, act, added, removed);
        };
        this.selectionCache = [];
        this.accumulateEvents = -1;
    }
    get idtypes() {
        return [];
    }
    selectionListener(idtype, index, total) {
        return (event, type, act, added, removed) => {
            this.selectionCache[index] = { act, added, removed };
            if (this.accumulateEvents < 0 || (++this.accumulateEvents) === total) {
                this.fillAndSend(type, index);
            }
        };
    }
    fillAndSend(type, trigger) {
        const ids = this.idtypes;
        const full = ids.map((id, i) => {
            const entry = this.selectionCache[i];
            if (entry) {
                return entry;
            }
            return {
                act: id.selections(type),
                added: [],
                removed: []
            };
        });
        const act = full.map((entry) => entry.act);
        const added = Range.join(full.map((entry) => entry.added));
        const removed = Range.join(full.map((entry) => entry.removed));
        this.selectionCache = [];
        this.accumulateEvents = -1; //reset
        this.singleSelectionListener(null, type, act, added, removed);
    }
    on(events, handler) {
        if (typeof events === 'string' && (events === ASelectAble.EVENT_SELECT || events.slice(0, 'select-'.length) === 'select-')) {
            this.numSelectListeners++;
            if (this.numSelectListeners === 1) {
                const idt = this.idtypes;
                if (idt.length === 1) {
                    this.selectionListeners.push(this.singleSelectionListener);
                    idt[0].on(ASelectAble.EVENT_SELECT, this.singleSelectionListener);
                }
                else {
                    idt.forEach((idtype, i) => {
                        const s = this.selectionListener(idtype, i, idt.length);
                        this.selectionListeners.push(s);
                        idtype.on(ASelectAble.EVENT_SELECT, s);
                    });
                }
            }
        }
        return super.on(events, handler);
    }
    off(events, handler) {
        if (typeof events === 'string' && (events === ASelectAble.EVENT_SELECT || events.slice(0, 'select-'.length) === 'select-')) {
            this.numSelectListeners--;
            if (this.numSelectListeners === 0) {
                this.idtypes.forEach((idtype, i) => idtype.off(ASelectAble.EVENT_SELECT, this.selectionListeners[i]));
                this.selectionListeners = [];
            }
        }
        return super.off(events, handler);
    }
    async selections(type = SelectionUtils.defaultSelectionType) {
        return this.idtypes.map((idtype) => idtype.selections(type)).flat();
    }
    select() {
        const a = Array.from(arguments);
        const dim = (typeof a[0] === 'number') ? +a.shift() : -1, type = (typeof a[0] === 'string') ? a.shift() : SelectionUtils.defaultSelectionType, range = new Set(a[0]), op = SelectionUtils.asSelectOperation(a[1]);
        return this.selectImpl(range, op, type, dim);
    }
    async selectImpl(selection, op = SelectOperation.SET, type = SelectionUtils.defaultSelectionType, dim = -1) {
        const types = this.idtypes;
        let ids = await this.indices();
        if (dim === -1) {
            range = ids.preMultiply(range);
            this.accumulateEvents = 0;
            const r = Range.join(range.split().map((r, i) => types[i].select(type, r, op)));
            if (this.accumulateEvents > 0) { //one event has not been fires, so do it manually
                this.fillAndSend(type, -1);
            }
            while (r.ndim < types.length) {
                r.dim(r.ndim); //create intermediate ones
            }
            return ids.indexRangeOf(r);
        }
        else {
            //just a single dimension
            ids = ids.split()[dim];
            range = ids.preMultiply(range);
            types[dim].select(type, range, op);
            return ids.indexRangeOf(range);
        }
    }
    clear() {
        const a = Array.from(arguments);
        const dim = (typeof a[0] === 'number') ? +a.shift() : -1;
        const type = (typeof a[0] === 'string') ? a[0] : SelectionUtils.defaultSelectionType;
        return this.selectImpl(new Set(), SelectOperation.SET, type, dim);
    }
}
ASelectAble.EVENT_SELECT = IDType.EVENT_SELECT;
//# sourceMappingURL=ASelectAble.js.map