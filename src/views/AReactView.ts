/** *******************************************************
 * Copyright (c) 2022 datavisyn GmbH, http://datavisyn.io
 *
 * This file is property of datavisyn.
 * Code and any other files associated with this project
 * may not be copied and/or distributed without permission.
 *
 * Proprietary and confidential. No warranty.
 *
 ******************************************************** */
import { ReactElement } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { IDTypeLike, IDTypeManager } from 'visyn_core/idtype';
import { AView } from './AView';
import { ISelection, IViewContext } from '../base';
import { Errors } from '../components';

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

  private reactViewBodyRoot: Root;

  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options: Partial<Readonly<IReactViewOptions>> = {}) {
    super(context, selection, parent);

    this.handler = options && options.reactHandler ? options.reactHandler : null;

    this.node.classList.add('react-view');
    // this.node.innerHTML = `<div class="react-view-body"></div>`;
    const child = parent.ownerDocument.createElement('div');
    // child.classList.add('react-view-body');

    this.node.appendChild(child);

    // const child = <HTMLElement>this.node.querySelector('div.react-view-body');
    // if (!child.hasAttribute('data-reactroot')) {
    this.reactViewBodyRoot = createRoot(child);
    // child.setAttribute('data-reactroot', 'true');
    // }
  }

  protected initImpl() {
    super.initImpl();
    return this.initReact();
  }

  protected initReact() {
    if (this.handler) {
      // will be handled externally
      return undefined;
    }
    return this.update();
  }

  private selectImpl(name: string | string[], op: 'add' | 'set' | 'remove' | 'toggle' = 'set'): string[] {
    const ids = Array.isArray(name) ? name : [name];
    const idtype = this.itemIDType;
    const act = this.getItemSelection();
    let sel: string[] = [];
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
          } else {
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

  /**
   * return the IDType of contained items needed for the selection
   * @returns {IDTypeLike}
   */
  protected abstract getItemType(): IDTypeLike;

  private update() {
    console.assert(!this.handler);
    this.setBusy(true);
    const item = this.getItemSelection();
    return Promise.all([this.resolveSelection(), item.idtype ? item.ids : []])
      .then((names: string[][]) => {
        const inputSelection = names[0];
        const itemSelection = names[1];
        return this.render(inputSelection, itemSelection, this.select);
      })
      .then((elem: ReactElement<any>) => {
        this.setBusy(false);
        this.reactViewBodyRoot.render(elem);
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
    return undefined;
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
