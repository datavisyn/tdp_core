

import ARankingView, {IARankingViewOptions} from './ARankingView';
import {ENamedSetType, INamedSet} from '../storage';
import {ISelection, IViewContext} from './interfaces';
import {IParams} from '../rest';
import {retrieve} from 'phovea_core/src/session';

export interface IAStartListOptions extends IARankingViewOptions {
  namedSet: INamedSet;
}

/**
 * base class for ranking views start doen't require any input but can have as additional input a NamedSet they are representing
 */
export abstract class AStartList extends ARankingView {
  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options: Partial<IAStartListOptions> = {}) {
    super(context, selection, parent, Object.assign({
      additionalScoreParameter: options.namedSet,
      additionalComputeScoreParameter: options.namedSet,
      subType: {
        key: options.namedSet ? options.namedSet.subTypeKey : '',
        value: options.namedSet ? options.namedSet.subTypeValue : ''
      }
    }, options));
  }

  protected get namedSet(): INamedSet|null {
    return (<IAStartListOptions>this.options).namedSet || null;
  }

  protected buildNamedSetFilters(namedSetIdFilterKey: string = 'namedset4id', validFilterKey: (key: string)=>boolean = ()=>true): IParams {
    const namedSet = this.namedSet;
    if (!namedSet) {
      return {};
    }
    const filter: IParams = {};
    switch(namedSet.type) {
      case ENamedSetType.NAMEDSET:
        filter[namedSetIdFilterKey] = namedSet.id;
        break;
      case ENamedSetType.PANEL:
        filter.panel = namedSet.id;
        break;
      case ENamedSetType.FILTER:
        Object.assign(filter, namedSet.filter);
        break;
    }
    // TODO can't remember why the all exception
    if(this.namedSet.subTypeKey && validFilterKey(this.namedSet.subTypeKey) && this.namedSet.subTypeValue !== 'all') {
      if(this.namedSet.subTypeFromSession) {
        filter[this.namedSet.subTypeKey] = retrieve(this.namedSet.subTypeKey, this.namedSet.subTypeValue);
      } else {
        filter[this.namedSet.subTypeKey] = this.namedSet.subTypeValue;
      }
    }
    return filter;
  }
}

export default AStartList;
