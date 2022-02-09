import * as ReactDOM from 'react-dom';
import { AView } from './AView';
import { Errors } from '../components';
import { IDTypeManager } from '../idtype';
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
            return undefined;
        }
        return this.update();
    }
    selectImpl(name, op = 'set') {
        const ids = Array.isArray(name) ? name : [name];
        const idtype = this.itemIDType;
        const act = this.getItemSelection();
        let sel = [];
        switch (op) {
            case 'add':
                sel = Array.from(new Set([...act.ids, ...ids]));
                break;
            case 'remove':
                sel = act.ids.filter((actId) => !ids.includes(actId));
                break;
            case 'toggle':
                // eslint-disable-next-line no-case-declarations
                const toggling = new Set(act.ids);
                ids.forEach((id) => {
                    if (toggling.has(id)) {
                        toggling.delete(id);
                    }
                    else {
                        toggling.add(id);
                    }
                });
                sel = Array.from(toggling);
                break;
            default:
                sel = ids;
                break;
        }
        this.setItemSelection({ idtype, ids: sel });
        this.update();
        return sel;
    }
    get itemIDType() {
        return IDTypeManager.getInstance().resolveIdType(this.getItemType());
    }
    update() {
        console.assert(!this.handler);
        this.setBusy(true);
        const item = this.getItemSelection();
        return Promise.all([this.resolveSelection(), item.idtype ? item.ids : []])
            .then((names) => {
            const inputSelection = names[0];
            const itemSelection = names[1];
            return this.render(inputSelection, itemSelection, this.select);
        })
            .then((elem) => {
            this.setBusy(false);
            ReactDOM.render(elem, this.node.querySelector('div.react-view-body'));
        })
            .catch(Errors.showErrorModalDialog)
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
        return undefined;
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