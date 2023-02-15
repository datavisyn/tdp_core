import { UserSession } from 'visyn_core/security';
import { ARankingView } from '../lineup/ARankingView';
import { IARankingViewOptions } from '../lineup/IARankingViewOptions';
import { ENamedSetType, INamedSet } from '../storage/interfaces';
import { ISelection, IViewContext } from '../base/interfaces';
import { IParams } from '../base/rest';

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
        value: options.namedSet ? options.namedSet.subTypeValue : '',
      },
      ...options,
    });
  }

  protected get namedSet(): INamedSet | null {
    return (<IAStartListOptions>this.options).namedSet || null;
  }

  protected buildNamedSetFilters(namedSetIdFilterKey = 'namedset4id', validFilterKey: (key: string) => boolean = () => true): IParams {
    const { namedSet } = this;
    if (!namedSet) {
      return {};
    }
    const filter: IParams = {};
    switch (namedSet.type) {
      case ENamedSetType.NAMEDSET:
        filter[namedSetIdFilterKey] = namedSet.id;
        break;
      case ENamedSetType.PANEL:
        filter.panel = namedSet.id;
        break;
      case ENamedSetType.FILTER:
        Object.assign(filter, namedSet.filter);
        break;
      default:
        break;
    }
    // TODO can't remember why the all exception
    if (this.namedSet.subTypeKey && validFilterKey(this.namedSet.subTypeKey) && this.namedSet.subTypeValue !== 'all') {
      if (this.namedSet.subTypeFromSession) {
        filter[this.namedSet.subTypeKey] = UserSession.getInstance().retrieve(this.namedSet.subTypeKey, this.namedSet.subTypeValue);
      } else {
        filter[this.namedSet.subTypeKey] = this.namedSet.subTypeValue;
      }
    }
    return filter;
  }
}
