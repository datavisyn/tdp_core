import {IDType, IDTypeManager, ParseRangeUtils, RangeLike, UserSession, ISecureItem, Ajax, AppContext, Permission} from 'phovea_core';
import {REST_NAMESPACE as TDP_NAMESPACE} from '../base/rest';
import {ENamedSetType, IStoredNamedSet} from './interfaces';


const REST_NAMESPACE = `${TDP_NAMESPACE}/storage`;

export function listNamedSets(idType: IDType | string = null): Promise<IStoredNamedSet[]> {
  const args = idType ? {idType: IDTypeManager.getInstance().resolveIdType(idType).id} : {};
  return AppContext.getInstance().getAPIJSON(`${REST_NAMESPACE}/namedsets/`, args).then((sets: IStoredNamedSet[]) => {
    // default value
    sets.forEach((s) => s.type = s.type || ENamedSetType.NAMEDSET);
    return sets;
  });
}

export function listNamedSetsAsOptions(idType: IDType | string = null) {
  return listNamedSets(idType).then((namedSets) => namedSets.map((d) => ({name: d.name, value: d.id})));
}

export function saveNamedSet(name: string, idType: IDType | string, ids: RangeLike, subType: { key: string, value: string }, description = '', sec: Partial<ISecureItem>) {
  const data = Object.assign({
    name,
    type: ENamedSetType.NAMEDSET,
    creator: UserSession.getInstance().currentUserNameOrAnonymous(),
    permissions: Permission.ALL_READ_NONE,
    idType: IDTypeManager.getInstance().resolveIdType(idType).id,
    ids: ParseRangeUtils.parseRangeLike(ids).toString(),
    subTypeKey: subType.key,
    subTypeValue: subType.value,
    description
  }, sec);
  return AppContext.getInstance().sendAPI(`${REST_NAMESPACE}/namedsets/`, data, 'POST');
}

export function deleteNamedSet(id: string) {
  return AppContext.getInstance().sendAPI(`${REST_NAMESPACE}/namedset/${id}`, {}, 'DELETE');
}

export function editNamedSet(id: string, data: { [key: string]: any }) {
  return AppContext.getInstance().sendAPI(`${REST_NAMESPACE}/namedset/${id}`, data, 'PUT').then((s) => {
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
  return AppContext.getInstance().getAPIJSON(`${REST_NAMESPACE}/attachment/${id}`);
}

/**
 * uploads an attachment file to the TDP server
 * @param {Object} data
 * @returns {Promise<string>} a promise with the attachment id
 */
export function addAttachment(data: object): Promise<string> {
  return Ajax.send(AppContext.getInstance().api2absURL(`${REST_NAMESPACE}/attachment/`), data, 'POST', 'text', 'json');
}
