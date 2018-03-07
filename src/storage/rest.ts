import {api2absURL, send, getAPIJSON, sendAPI} from 'phovea_core/src/ajax';
import {IDType, resolve} from 'phovea_core/src/idtype';
import {parse, RangeLike} from 'phovea_core/src/range';
import {currentUserNameOrAnonymous, ALL_READ_NONE, ALL_READ_READ} from 'phovea_core/src/security';
import {REST_NAMESPACE as TDP_NAMESPACE} from '../rest';
import {ENamedSetType, IStoredNamedSet} from './interfaces';


const REST_NAMESPACE = `${TDP_NAMESPACE}/storage`;

export function listNamedSets(idType: IDType | string = null): Promise<IStoredNamedSet[]> {
  const args = idType ? {idType: resolve(idType).id} : {};
  return getAPIJSON(`${REST_NAMESPACE}/namedsets/`, args).then((sets: IStoredNamedSet[]) => {
    // default value
    sets.forEach((s) => s.type = s.type || ENamedSetType.NAMEDSET);
    return sets;
  });
}

export function listNamedSetsAsOptions(idType: IDType | string = null) {
  return listNamedSets(idType).then((namedSets) => namedSets.map((d) => ({name: d.name, value: d.id})));
}

export function saveNamedSet(name: string, idType: IDType | string, ids: RangeLike, subType: { key: string, value: string }, description = '', isPublic: boolean = false) {
  const data = {
    name,
    type: ENamedSetType.NAMEDSET,
    creator: currentUserNameOrAnonymous(),
    permissions: isPublic ? ALL_READ_READ : ALL_READ_NONE,
    idType: resolve(idType).id,
    ids: parse(ids).toString(),
    subTypeKey: subType.key,
    subTypeValue: subType.value,
    description
  };
  return sendAPI(`${REST_NAMESPACE}/namedsets/`, data, 'POST');
}

export function deleteNamedSet(id: string) {
  return sendAPI(`${REST_NAMESPACE}/namedset/${id}`, {}, 'DELETE');
}

export function editNamedSet(id: string, data: { [key: string]: any }) {
  return sendAPI(`${REST_NAMESPACE}/namedset/${id}`, data, 'PUT').then((s) => {
    s.type = s.type || ENamedSetType.NAMEDSET;
    return s;
  });
}


/**
 * get the content of an uploaded attachment
 * @param {string} id the attachment id
 * @returns {Promise<object>} the data
 */
export function getAttachment(id: string): Promise<object> {
  return getAPIJSON(`${REST_NAMESPACE}/attachment/${id}`);
}

/**
 * uploads an attachment file to the TDP server
 * @param {Object} data
 * @returns {Promise<string>} a promise with the attachment id
 */
export function addAttachment(data: object): Promise<string> {
  return send(api2absURL(`${REST_NAMESPACE}/attachment/`), data, 'POST', 'text', 'json');
}
