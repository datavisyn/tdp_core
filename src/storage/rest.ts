import { IDType, IDTypeManager } from 'visyn_core/idtype';
import { AppContext, UserSession } from '../app';
import { Ajax } from '../base';
import { RestBaseUtils } from '../base/rest';
import { ISecureItem, Permission } from '../security';
import { ENamedSetType, IStoredNamedSet } from './interfaces';

export class RestStorageUtils {
  public static readonly REST_NAMESPACE = `${RestBaseUtils.REST_NAMESPACE}/storage`;

  public static listNamedSets(idType: IDType | string = null): Promise<IStoredNamedSet[]> {
    const args = idType ? { idType: IDTypeManager.getInstance().resolveIdType(idType).id } : {};
    return AppContext.getInstance()
      .getAPIJSON(`${RestStorageUtils.REST_NAMESPACE}/namedsets/`, args)
      .then((sets: IStoredNamedSet[]) => {
        // default value
        sets.forEach((s) => (s.type = s.type || ENamedSetType.NAMEDSET));
        return sets;
      });
  }

  static listNamedSetsAsOptions(idType: IDType | string = null) {
    return RestStorageUtils.listNamedSets(idType).then((namedSets) => namedSets.map((d) => ({ name: d.name, value: d.id })));
  }

  static saveNamedSet(
    name: string,
    idType: IDType | string,
    ids: string[],
    subType: { key: string; value: string },
    description = '',
    sec: Partial<ISecureItem> = {},
  ) {
    const data = {
      name,
      type: ENamedSetType.NAMEDSET,
      creator: UserSession.getInstance().currentUserNameOrAnonymous(),
      permissions: Permission.ALL_READ_NONE,
      idType: IDTypeManager.getInstance().resolveIdType(idType).id,
      ids,
      subTypeKey: subType.key,
      subTypeValue: subType.value,
      description,
      ...sec,
    };
    return AppContext.getInstance().sendAPI(`${RestStorageUtils.REST_NAMESPACE}/namedsets/`, data, 'POST');
  }

  static deleteNamedSet(id: string) {
    return AppContext.getInstance().sendAPI(`${RestStorageUtils.REST_NAMESPACE}/namedset/${id}`, {}, 'DELETE');
  }

  static editNamedSet(id: string, data: { [key: string]: any }) {
    return AppContext.getInstance()
      .sendAPI(`${RestStorageUtils.REST_NAMESPACE}/namedset/${id}`, data, 'PUT')
      .then((s) => {
        s.type = s.type || ENamedSetType.NAMEDSET;
        return s;
      });
  }

  /**
   * get the content of an uploaded attachment
   * @param {string} id the attachment id
   * @returns {Promise<object>} the data
   */
  static getAttachment(id: string): Promise<object> {
    return AppContext.getInstance().getAPIJSON(`${RestStorageUtils.REST_NAMESPACE}/attachment/${id}`);
  }

  /**
   * uploads an attachment file to the TDP server
   * @param {Object} data
   * @returns {Promise<string>} a promise with the attachment id
   */
  static addAttachment(data: object): Promise<string> {
    return Ajax.send(AppContext.getInstance().api2absURL(`${RestStorageUtils.REST_NAMESPACE}/attachment/`), data, 'POST', 'text', 'json');
  }
}
