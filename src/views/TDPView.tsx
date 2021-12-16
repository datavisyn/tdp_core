/*********************************************************
 * Copyright (c) 2018 datavisyn GmbH, http://datavisyn.io
 *
 * This file is property of datavisyn.
 * Code and any other files associated with this project
 * may not be copied and/or distributed without permission.
 *
 * Proprietary and confidential. No warranty.
 *
 *********************************************************/

import {AReactView, IReactHandler} from './AReactView';
import * as React from 'react';
import {EXTENSION_POINT_TDP_VIEW, ISelection, IView, IViewContext, IViewPlugin, IViewPluginDesc} from '../base';
import {AView} from './AView';
import {ViewUtils} from './ViewUtils';
import {PluginRegistry} from '../app';
import {IDType, IDTypeManager} from '../idtype';
import {Range} from '../range';
import {LocalStorageProvenanceGraphManager, ObjectRefUtils} from '../provenance';

export interface ITDPViewProps {
  viewId: string;
  inputSelection?: string[];
  itemSelection?: string[];
  onItemSelectionChanged?(selection: string[], idType: string): void;
}

export interface ITDPViewState {
  viewPlugin: IViewPluginDesc;
}

export class TDPView extends React.Component<Readonly<ITDPViewProps>, ITDPViewState> implements IReactHandler {
  private node: HTMLElement;
  private viewPromise: Promise<IView> = null;
  private view: IView = null;
  private viewId: string = null;

  private readonly listener = (_: any, _oldSelection: any, newSelection: ISelection) => {
    this.triggerSelection(newSelection);
  }

  constructor(props: ITDPViewProps, context?: any) {
    super(props, context);

    this.state = {
      viewPlugin: ViewUtils.toViewPluginDesc(PluginRegistry.getInstance().getPlugin(EXTENSION_POINT_TDP_VIEW, props.viewId))
    };
  }

  componentDidMount() {
    this.componentDidUpdate();
  }

  componentWillUnmount() {
    if (this.view) {
      this.view.destroy();
      this.view = null;
      this.viewPromise = null;
    }
    if (this.viewPromise) {
      this.viewPromise.then((r) => r.destroy());
      this.viewPromise = null;
    }
  }

  componentDidUpdate() {
    const {viewId} = this.props;
    if (this.viewId !== viewId) {
      if (this.view) {
        this.view.destroy();
        this.view = null;
      } else if (this.viewPromise) {
        this.viewPromise.then((v) => v.destroy());
      }
      this.view = null;
      this.viewPromise = null;
      this.viewId = viewId;
      this.setState({
        viewPlugin: ViewUtils.toViewPluginDesc(PluginRegistry.getInstance().getPlugin(EXTENSION_POINT_TDP_VIEW, viewId))
      });
    }
    if (!this.state.viewPlugin) {
      return;
    }
    const idType = IDTypeManager.getInstance().resolveIdType(this.state.viewPlugin.idtype);

    if (!this.viewPromise) {
      const options = {
        reactHandler: this
      };
      const selection = this.buildSelection(idType, this.props.inputSelection);
      const context = this.createContext();
      this.viewPromise = Promise.all([this.state.viewPlugin.load(), selection]).then((args) => {
        const p: IViewPlugin = args[0];
        const s: ISelection = args[1];

        this.view = p.factory(context, s, this.node.lastElementChild! as HTMLElement, options);
        this.view.init(this.node.firstElementChild as HTMLElement, (name: string, value: any) => Promise.resolve(this.view.setParameter(name, value)));
        this.node.classList.add('tdp-view-wrapper');

        if (this.view instanceof AReactView) {
          // native rendering
          return;
        }

        this.view.on(AView.EVENT_ITEM_SELECT, this.listener);
        if ( this.view.itemIDType) {
          return this.buildSelection(this.view.itemIDType, this.props.itemSelection).then((itemSelection) => {
            this.view.off(AView.EVENT_ITEM_SELECT, this.listener);
            this.view.setItemSelection(itemSelection);
            this.view.on(AView.EVENT_ITEM_SELECT, this.listener);
            return this.view;
          });
        }
        return this.view;
      });
    }

    this.viewPromise.then((view) => {
      if (this.view instanceof AReactView) {
        // native rendering
        return;
      }
      this.buildSelection(idType, this.props.inputSelection).then((s) => view.setInputSelection(s));
      if (view.itemIDType) {
        this.buildSelection(this.view.itemIDType, this.props.itemSelection).then((s) => {
          this.view.off(AView.EVENT_ITEM_SELECT, this.listener);
          this.view.setItemSelection(s);
          this.view.on(AView.EVENT_ITEM_SELECT, this.listener);
        });
      }
    });
  }


  private createContext(): IViewContext {
    const manager = new LocalStorageProvenanceGraphManager();
    const graph = manager.createInMemory();
    const ref = graph.findOrAddJustObject(this, `React@${this.props.viewId}`, ObjectRefUtils.category.visual);
    return {
      graph,
      desc: this.state.viewPlugin,
      ref
    };
  }

  private buildSelection(idtype: IDType, selection: string[]): Promise<ISelection> {
    if (!selection) {
      return Promise.resolve({idtype, range: Range.none()});
    }
    return idtype.map(selection).then((ids) => ({idtype, range: Range.list(ids)}));
  }

  private triggerSelection(selection: ISelection) {
    if (!this.props.onItemSelectionChanged) {
      return;
    }
    selection.idtype.unmap(selection.range).then((names) => this.props.onItemSelectionChanged(names, selection.idtype.id));
  }

  render() {
    const buildItem = () => {
      if (!this.state.viewPlugin) {
        return `Invalid View Id: ${this.props.viewId}`;
      }
      if (this.view && this.view instanceof AReactView) {
        return this.view.render(this.props.inputSelection || [], this.props.itemSelection || [], (item, op) => this.selectNative(item, op));
      }
      return '';
    };

    return <div ref={(ref) => this.node = ref as HTMLElement} className="tdp-view">
      <header />
      <main>{buildItem()}</main>
    </div>;
  }

  private selectNative(item: string|string[], op: 'add' | 'set' | 'remove' | 'toggle' = 'set') {
    const items = Array.isArray(item) ? item: [item];
    if  (!this.props.onItemSelectionChanged) {
      return; //nobody cares
    }
    const s = new Set(this.props.itemSelection || []);
    switch(op) {
      case 'set':
        s.clear();
        items.forEach((item) => s.add(item));
        break;
      case 'add':
        items.forEach((item) => s.add(item));
        break;
      case 'remove':
        items.forEach((item) => s.delete(item));
        break;
      case 'toggle':
        items.forEach((item) => s.has(item) ? s.delete(item) : s.add(item));
        break;
    }
    this.props.onItemSelectionChanged(Array.from(s), this.view.itemIDType ? this.view.itemIDType.id : null);
  }
}
