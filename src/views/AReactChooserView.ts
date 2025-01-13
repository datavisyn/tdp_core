import { IDTypeLike } from 'visyn_core/idtype';

import { AReactView } from './AReactView';
import { ISelectionChooserOptions, SelectionChooser } from './SelectionChooser';

/**
 * definition how to select elements within the react view
 */
export interface IChooserViewSelector {
  (name: string | string[], op?: 'add' | 'set' | 'remove' | 'toggle'): void;
}

/**
 * to have a shortcut for react in react
 */
export interface IReactChooserViewHandler {
  forceUpdate(): void;
}

export interface IReactChooserViewOptions {
  reactHandler: IReactChooserViewHandler;
}

/**
 * a TDP view that is internally implemented using react.js
 */
export abstract class AReactChooserView extends AReactView {
  protected readonly chooser: SelectionChooser = this.createSelectionChooser();

  private createSelectionChooser() {
    const o = this.createSelectionChooserOptions();
    return new SelectionChooser((id) => this.getParameterElement(id), o.target, o);
  }

  protected abstract createSelectionChooserOptions(): Partial<ISelectionChooserOptions> & { target: IDTypeLike };

  protected initReact() {
    return this.chooser.init(this.selection).then(() => {
      return super.initReact();
    });
  }

  protected resolveSelection() {
    // resolve just the chosen one
    const s = this.chooser.chosen();
    return Promise.resolve(s ? [s.name] : []);
  }

  protected getParameterFormDescs() {
    return super.getParameterFormDescs().concat([this.chooser.desc]);
  }

  selectionChanged() {
    return this.chooser.update(this.selection).then(() => super.selectionChanged());
  }
}
