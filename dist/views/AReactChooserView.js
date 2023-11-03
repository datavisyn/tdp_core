import { AReactView } from './AReactView';
import { SelectionChooser } from './SelectionChooser';
/**
 * a TDP view that is internally implemented using react.js
 */
export class AReactChooserView extends AReactView {
    constructor() {
        super(...arguments);
        this.chooser = this.createSelectionChooser();
    }
    createSelectionChooser() {
        const o = this.createSelectionChooserOptions();
        return new SelectionChooser((id) => this.getParameterElement(id), o.target, o);
    }
    initReact() {
        return this.chooser.init(this.selection).then(() => {
            return super.initReact();
        });
    }
    resolveSelection() {
        // resolve just the chosen one
        const s = this.chooser.chosen();
        return Promise.resolve(s ? [s.name] : []);
    }
    getParameterFormDescs() {
        return super.getParameterFormDescs().concat([this.chooser.desc]);
    }
    selectionChanged() {
        return this.chooser.update(this.selection).then(() => super.selectionChanged());
    }
}
//# sourceMappingURL=AReactChooserView.js.map