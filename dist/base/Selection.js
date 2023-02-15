import { merge } from 'lodash';
import { IDTypeManager, SelectionUtils } from 'visyn_core/idtype';
import { EventHandler, GlobalEventHandler } from './event';
import { AppContext } from '../app';
import { ObjectRefUtils } from '../clue/provenance';
import { ActionMetaData } from '../clue/provenance/ActionMeta';
import { Compression } from '../clue/base/Compression';
const disabler = new EventHandler();
export class Selection {
    static select(inputs, parameter, graph, within) {
        const idtype = IDTypeManager.getInstance().resolveIdType(parameter.idtype);
        const { selection } = parameter;
        const { type } = parameter;
        const bak = parameter.old || idtype.selections(type);
        if (AppContext.getInstance().hash.has('debug')) {
            console.log('select', selection);
        }
        disabler.fire(`disable-${idtype.id}`);
        idtype.select(type, selection);
        disabler.fire(`enable-${idtype.id}`);
        return Selection.createSelection(idtype, type, bak, selection, parameter.animated).then((cmd) => ({
            inverse: cmd,
            consumed: parameter.animated ? within : 0,
        }));
    }
    static capitalize(s) {
        return s
            .split(' ')
            .map((d) => d[0].toUpperCase() + d.slice(1))
            .join(' ');
    }
    static meta(idtype, type, selection) {
        const l = selection.length;
        let title = type === SelectionUtils.defaultSelectionType ? '' : `${Selection.capitalize(type)} `;
        let p;
        if (l === 0) {
            title += `no ${idtype.names}`;
            p = Promise.resolve(title);
        }
        else if (l === 1) {
            title += `${idtype.name} ${selection[0]}`;
            p = Promise.resolve(title);
        }
        else if (l < 3) {
            title += `${idtype.names} (${selection.join(', ')})`;
            p = Promise.resolve(title);
        }
        else {
            title += `${l} ${idtype.names}`;
            p = Promise.resolve(title);
        }
        return p.then((t) => ActionMetaData.actionMeta(t, ObjectRefUtils.category.selection));
    }
    /**
     * create a selection command
     * @param idtype
     * @param type
     * @param selection
     * @param old optional the old selection for inversion
     * @returns {Cmd}
     */
    static createSelection(idtype, type, selection, old = null, animated = false) {
        return Selection.meta(idtype, type, selection).then((meta) => {
            return {
                meta,
                id: 'select',
                f: Selection.select,
                parameter: {
                    idtype: idtype.id,
                    selection,
                    type,
                    old,
                    animated,
                },
            };
        });
    }
    static compressSelection(path) {
        return Compression.lastConsecutive(path, 'select', (p) => `${p.parameter.idtype}@${p.parameter.type}`);
    }
}
/**
 * utility class to record all the selections within the provenance graph for a specific idtype
 */
class SelectionTypeRecorder {
    constructor(idtype, graph, type, options = {}) {
        this.idtype = idtype;
        this.graph = graph;
        this.type = type;
        this.options = options;
        this.l = (event, type, sel, added, removed, old) => {
            Selection.createSelection(this.idtype, type, sel, old, this.options.animated).then((cmd) => this.graph.push(cmd));
        };
        this._enable = this.enable.bind(this);
        this._disable = this.disable.bind(this);
        this.typeRecorders = [];
        if (this.type) {
            this.typeRecorders = this.type.split(',').map((ttype) => {
                const t = (event, sel, added, removed, old) => {
                    return this.l(event, ttype, sel, added, removed, old);
                };
                return t;
            });
        }
        this.enable();
        disabler.on(`enable-${this.idtype.id}`, this._enable);
        disabler.on(`disable-${this.idtype.id}`, this._disable);
    }
    disable() {
        if (this.type) {
            this.type.split(',').forEach((ttype, i) => {
                this.idtype.off(`select-${ttype}`, this.typeRecorders[i]);
            });
        }
        else {
            this.idtype.off('select', this.l);
        }
    }
    enable() {
        if (this.type) {
            this.type.split(',').forEach((ttype, i) => {
                this.idtype.on(`select-${ttype}`, this.typeRecorders[i]);
            });
        }
        else {
            this.idtype.on('select', this.l);
        }
    }
    destroy() {
        this.disable();
        disabler.off(`enable-${this.idtype.id}`, this._enable);
        disabler.off(`disable-${this.idtype.id}`, this._disable);
    }
}
/**
 * utility class to record all the selections within the provenance graph
 */
export class SelectionRecorder {
    constructor(graph, type, options = {}) {
        this.graph = graph;
        this.type = type;
        this.options = options;
        this.handler = [];
        this.adder = (event, idtype) => {
            if (this.options.filter(idtype)) {
                this.handler.push(new SelectionTypeRecorder(idtype, this.graph, this.type, this.options));
            }
        };
        this.options = merge({
            filter: true,
            animated: false,
        }, this.options);
        GlobalEventHandler.getInstance().on('register.idtype', this.adder);
        IDTypeManager.getInstance()
            .listIdTypes()
            .forEach((d) => {
            this.adder(null, d);
        });
    }
    destroy() {
        GlobalEventHandler.getInstance().off('register.idtype', this.adder);
        this.handler.forEach((h) => h.destroy());
        this.handler.length = 0;
    }
    static createSelectionRecorder(graph, type, options = {}) {
        return new SelectionRecorder(graph, type, options);
    }
}
//# sourceMappingURL=Selection.js.map