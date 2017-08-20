
import {api2absURL, getAPIJSON} from 'phovea_core/src/ajax';

const REST_NAMESPACE = 'tdp';

export function getProxyUrl(proxy: string, args: any) {
  return api2absURL(`${REST_NAMESPACE}/proxy/${proxy}`, args);
}

export function getTDPData(database: string, view: string, method: 'none'|'filter'|'desc'|'score'|'count'|'lookup', params: any) {
  const mmethod = method === 'none' ? '' : `/${method}`;
  return getAPIJSON(`${REST_NAMESPACE}/db/${database}/${view}${mmethod}`, params);
}
