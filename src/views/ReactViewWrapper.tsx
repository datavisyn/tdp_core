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

import * as React from 'react';

import { IViewPluginDesc } from '../base';
import { AReactView, ISelector } from './AReactView';

export interface IWrappedProps {
  inputSelection: string[];
  itemSelection: string[];
  itemSelector: ISelector;
}

export interface IComponentModule {
  default: new (props?: IWrappedProps, context?: any) => React.Component<IWrappedProps, any>;
}

export interface IReactViewWrapperPluginDesc extends IViewPluginDesc {
  itemType?: string;
  component: () => Promise<IComponentModule>;
}

/**
 * a view that wrapy any React element having @see IWrappedProps as properties
 */
export class ReactViewWrapper extends AReactView {
  private impl: IComponentModule;

  get desc() {
    return this.context.desc as IReactViewWrapperPluginDesc;
  }

  protected initImpl() {
    this.desc.component().then((r) => {
      this.impl = r;
      this.forceUpdate();
    });
    return super.initImpl();
  }

  protected getItemType() {
    return this.context.desc.itemIDType || null;
  }

  render(inputSelection: string[], itemSelection: string[], itemSelector: ISelector) {
    if (!this.impl) {
      return <div>Loading...</div>;
    }
    return React.createElement(this.impl.default, { inputSelection, itemSelection, itemSelector });
  }
}
