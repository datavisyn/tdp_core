import * as React from 'react';
import {AReactView, ISelector} from '../views/AReactView';
import {AReactChooserView} from '../views/AReactChooserView';

export class DummyReactView extends AReactChooserView {
  getItemType() {
    return this.idType;
  }

  createSelectionChooserOptions() {
    return {
      target: 'IDTypeA'
    };
  }

  render(inputSelection: string[], itemSelection: string[], itemSelector: ISelector) {
    return <ul>
        {inputSelection.map((s) => <li key={s} style={{backgroundColor: itemSelection.indexOf(s) >= 0 ? 'orange': null}} onClick={() => itemSelector(s)}>{s}</li>)}
    </ul>;
  }
}
