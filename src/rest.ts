
import {api2absURL, getAPIJSON} from 'phovea_core/src/ajax';
import {IScoreRow, IRow} from './lineup';

export const REST_NAMESPACE = 'tdp';

export function getProxyUrl(proxy: string, args: any) {
  return api2absURL(`${REST_NAMESPACE}/proxy/${proxy}`, args);
}

export interface IParams {
  [key: string]: string|number|boolean|string[];
}

function getTDPDataImpl(database: string, view: string, method: 'none'|'filter'|'desc'|'score'|'count'|'lookup', params: IParams = {}, assignIds: boolean = false) {
  const mmethod = method === 'none' ? '' : `/${method}`;
  if (assignIds) {
    params._assignids = true; // assign globally ids on the server side
  }
  return getAPIJSON(`${REST_NAMESPACE}/db/${database}/${view}${mmethod}`, params);
}

export function getTDPData<T>(database: string, view: string, params: IParams = {}, assignIds: boolean = false): Promise<T[]> {
  return getTDPDataImpl(database, view, 'none', params, assignIds);
}

export function getTDPRows(database: string, view: string, params: IParams = {}, assignIds: boolean = false): Promise<IRow[]> {
  return getTDPDataImpl(database, view, 'none', params, assignIds);
}

function prefixFilter(filters: IParams) {
  const r : IParams = {};
  Object.keys(filters).map((key) => r[`filter_${key}`] = filters[key]);
  return r;
}

export function getTDPFilteredRows(database: string, view: string, params: IParams, filters: IParams, assignIds: boolean = false): Promise<IRow[]> {
  return getTDPDataImpl(database, view, 'filter', Object.assign({}, params, prefixFilter(filters), assignIds), assignIds);
}

export function getTDPScore<T>(database: string, view: string, params: IParams = {}, filters: IParams = {}): Promise<IScoreRow<T>[]> {
  return getTDPDataImpl(database, view, 'score', Object.assign({}, params, prefixFilter(filters)));
}

export function getTDPCount(database: string, view: string, params: IParams = {}): Promise<number> {
  return getTDPDataImpl(database, view, 'count', params);
}

export interface ILookupItem {
  _id: number;
  id: string;
  text: string;
}

export interface ILookupResult {
  items: ILookupItem[];
  more: boolean;
}

export function getTDPLookup(database: string, view: string, params: any = {}, assignIds: boolean = false): Promise<Readonly<ILookupResult>> {
  return getTDPDataImpl(database, view, 'lookup', params, assignIds);
}

export interface IServerColumn {
  label: string;
  column: string;
  type: 'categorical' | 'number' | 'string';

  categories?: string[];

  min?: number;
  max?: number;
}

export interface IViewDescription {
  columns: IServerColumn[];
}

export function getTDPDesc(database: string, view: string): Promise<Readonly<IViewDescription>> {
  return getTDPDataImpl(database, view, 'desc');
}
