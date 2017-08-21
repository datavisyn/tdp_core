

import {ISelectionAdapter} from './ISelectionAdapter';
import SingleSelectionAdapter, {ISingleSelectionAdapter} from './internal/SingleSelectionAdapter';
import MultiSelectionAdapter, {IMultiSelectionAdapter} from './internal/MultiSelectionAdapter';

export {ISelectionAdapter, ISelectionColumn, IContext} from './ISelectionAdapter';


export function single(adapter: ISingleSelectionAdapter): ISelectionAdapter {
  return new SingleSelectionAdapter(adapter);
}


export function multi(adapter: IMultiSelectionAdapter): ISelectionAdapter {
  return new MultiSelectionAdapter(adapter);
}

export function none(): ISelectionAdapter {
  return {
    parameterChanged: ()=>undefined,
    selectionChanged: ()=>undefined
  };
}
