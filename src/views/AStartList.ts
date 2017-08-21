

import ARankingView, {IARankingViewOptions} from './ARankingView';
import {ENamedSetType, INamedSet} from '../storage';
import {ISelection, IViewContext} from './interfaces';

export interface IAStartListOptions extends IARankingViewOptions {
  namedSet: INamedSet;
}

/**
 * base class for ranking views start doen't require any input but can have as additional input a NamedSet they are representing
 */
export abstract class AStartList extends ARankingView {
  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options: Partial<IAStartListOptions> = {}) {
    super(context, selection, parent, {
      additionalScoreParameter: options.namedSet,
      additionalComputeScoreParameter: options.namedSet,
      subType: {
        key: options.namedSet ? options.namedSet.subTypeKey : '',
        value: options.namedSet ? options.namedSet.subTypeValue : ''
      }
    });
  }

  protected get namedSet(): INamedSet|null {
    return (<IAStartListOptions>this.options).namedSet || null;
  }

  protected buildNamedSetFilters(namedSetIdFilterKey: string = 'namedset4id') {
    const namedSet = this.namedSet;
    if (!namedSet) {
      return {};
    }
    switch(namedSet.type) {
      case ENamedSetType.NAMEDSET:
        return {[namedSetIdFilterKey]: namedSet.id};
      case ENamedSetType.FILTER:
        return Object.assign({}, namedSet.filter);
    }
  }
}

export default AStartList;
