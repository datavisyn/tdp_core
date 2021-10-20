import * as React from 'react';
import { AReactChooserView } from '../views/AReactChooserView';
export class DummyReactView extends AReactChooserView {
    getItemType() {
        return this.idType;
    }
    createSelectionChooserOptions() {
        return {
            target: 'IDTypeA'
        };
    }
    render(inputSelection, itemSelection, itemSelector) {
        return React.createElement("ul", null, inputSelection.map((s) => React.createElement("li", { key: s, style: { backgroundColor: itemSelection.indexOf(s) >= 0 ? 'orange' : null }, onClick: () => itemSelector(s) }, s)));
    }
}
//# sourceMappingURL=DummyReactView.js.map