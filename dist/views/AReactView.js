import * as ReactDOM from 'react-dom';
import { AView } from '.';
import { Errors } from '../components';
import { IDTypeManager } from '../idtype';
import { Range } from '../range';
/**
 * a TDP view that is internally implemented using react.js
 */
export class AReactView extends AView {
    constructor(context, selection, parent, options = {}) {
        super(context, selection, parent);
        this.select = this.selectImpl.bind(this);
        this.handler = options && options.reactHandler ? options.reactHandler : null;
        this.node.classList.add('react-view');
        this.node.innerHTML = `<div class="react-view-body"></div>`;
    }
    initImpl() {
        super.initImpl();
        return this.initReact();
    }
    initReact() {
        if (this.handler) {
            // will be handled externally
            return;
        }
        return this.update();
    }
    selectImpl(name, op = 'set') {
        const names = Array.isArray(name) ? name : [name];
        const idtype = this.itemIDType;
        return idtype.map(names).then((ids) => {
            const range = Range.list(ids);
            const act = this.getItemSelection();
            let r = [];
            switch (op) {
                case 'add':
                    const union = act.range.union(range);
                    this.setItemSelection({ idtype, range: union });
                    r = union.dim(0).asList();
                    break;
                case 'remove':
                    const without = act.range.without(range);
                    this.setItemSelection({ idtype, range: without });
                    r = without.dim(0).asList();
                    break;
                case 'toggle':
                    r = act.range.dim(0).asList();
                    ids.forEach((id) => {
                        const index = r.indexOf(id);
                        if (index >= 0) {
                            r.splice(index, 1);
                        }
                        else {
                            r.push(id);
                        }
                    });
                    r.sort((a, b) => a - b);
                    const result = Range.list(r);
                    this.setItemSelection({ idtype, range: result });
                    break;
                default:
                    this.setItemSelection({ idtype, range });
                    r = range.dim(0).asList();
                    break;
            }
            this.update();
            return r;
        });
    }
    get itemIDType() {
        return IDTypeManager.getInstance().resolveIdType(this.getItemType());
    }
    update() {
        console.assert(!this.handler);
        this.setBusy(true);
        const item = this.getItemSelection();
        return Promise.all([this.resolveSelection(), item.idtype ? item.idtype.unmap(item.range) : []])
            .then((names) => {
            const inputSelection = names[0];
            const itemSelection = names[1];
            return this.render(inputSelection, itemSelection, this.select);
        }).then((elem) => {
            this.setBusy(false);
            ReactDOM.render(elem, this.node.querySelector('div.react-view-body'));
        }).catch(Errors.showErrorModalDialog)
            .catch((r) => {
            console.error(r);
            this.setBusy(false);
            this.setHint(true, 'Error creating view');
        });
    }
    forceUpdate() {
        if (this.handler) {
            this.handler.forceUpdate();
        }
        else {
            return this.update();
        }
    }
    selectionChanged() {
        return this.update();
    }
    itemSelectionChanged() {
        return this.update();
    }
    parameterChanged(name) {
        super.parameterChanged(name);
        return this.update();
    }
}
//# sourceMappingURL=AReactView.js.map