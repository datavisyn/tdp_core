/** *******************************************************
 * Copyright (c) 2018 datavisyn GmbH, http://datavisyn.io
 *
 * This file is property of datavisyn.
 * Code and any other files associated with this project
 * may not be copied and/or distributed without permission.
 *
 * Proprietary and confidential. No warranty.
 *
 ******************************************************** */
import { ReactElement } from 'react';
import * as ReactDOM from 'react-dom';
import { AView } from '.';
import { ISelection, IViewContext } from '../base';
import { Errors } from '../components';
import { IDTypeLike, IDTypeManager } from '../idtype';
import { Range } from '../range';

/**
 * definition how to select elements within the react view
 */
export interface ISelector {
  (name: string | string[], op?: 'add' | 'set' | 'remove' | 'toggle'): void;
}

/**
 * to have a shortcut for react in react
 */
export interface IReactHandler {
  forceUpdate(): void;
}

export interface IReactViewOptions {
  reactHandler: IReactHandler;
}

/**
 * a TDP view that is internally implemented using react.js
 */
export abstract class AReactView extends AView {
  private readonly select: ISelector = this.selectImpl.bind(this);

  private readonly handler?: IReactHandler;

  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options: Partial<Readonly<IReactViewOptions>> = {}) {
    super(context, selection, parent);

    this.handler = options && options.reactHandler ? options.reactHandler : null;

    this.node.classList.add('react-view');
    this.node.innerHTML = `<div class="react-view-body"></div>`;
  }

  protected initImpl() {
    super.initImpl();
    return this.initReact();
  }

  protected initReact() {
    if (this.handler) {
      // will be handled externally
      return;
    }
    return this.update();
  }

  private selectImpl(name: string | string[], op: 'add' | 'set' | 'remove' | 'toggle' = 'set') {
    const names = Array.isArray(name) ? name : [name];
    const idtype = this.itemIDType;
    return idtype.map(names).then((ids) => {
      const range = Range.list(ids);
      const act = this.getItemSelection();
      let r: number[] = [];
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
            } else {
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

  /**
   * return the IDType of contained items needed for the selection
   * @returns {IDTypeLike}
   */
  protected abstract getItemType(): IDTypeLike;

  private update() {
    console.assert(!this.handler);
    this.setBusy(true);
    const item = this.getItemSelection();
    return Promise.all([this.resolveSelection(), item.idtype ? item.idtype.unmap(item.range) : []])
      .then((names: string[][]) => {
        const inputSelection = names[0];
        const itemSelection = names[1];
        return this.render(inputSelection, itemSelection, this.select);
      })
      .then((elem: ReactElement<any>) => {
        this.setBusy(false);
        ReactDOM.render(elem, <HTMLElement>this.node.querySelector('div.react-view-body'));
      })
      .catch(Errors.showErrorModalDialog)
      .catch((r) => {
        console.error(r);
        this.setBusy(false);
        this.setHint(true, 'Error creating view');
      });
  }

  /**
   * render this view with the given input
   * @param {string[]} inputSelection the current input selection
   * @param {string[]} itemSelection the current item selection
   * @param {ISelector} itemSelector utility to select items
   * @returns {Promise<React.ReactElement<any>> | React.ReactElement<any>} the react element of this view
   */
  abstract render(inputSelection: string[], itemSelection: string[], itemSelector: ISelector): Promise<ReactElement<any>> | ReactElement<any>;

  protected forceUpdate() {
    if (this.handler) {
      this.handler.forceUpdate();
    } else {
      return this.update();
    }
  }

  selectionChanged() {
    return this.update();
  }

  itemSelectionChanged() {
    return this.update();
  }

  protected parameterChanged(name: string) {
    super.parameterChanged(name);
    return this.update();
  }
}
