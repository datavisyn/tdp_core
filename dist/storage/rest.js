import { IDTypeManager } from 'visyn_core/idtype';
import { Permission, UserSession } from 'visyn_core/security';
import { AppContext } from 'visyn_core/base';
import { Ajax } from '../base';
import { RestBaseUtils } from '../base/rest';
import { ENamedSetType } from './interfaces';
class RestStorageUtils {
    static listNamedSets(idType = null) {
        const args = idType ? { idType: IDTypeManager.getInstance().resolveIdType(idType).id } : {};
        return AppContext.getInstance()
            .getAPIJSON(`${RestStorageUtils.REST_NAMESPACE}/namedsets/`, args)
            .then((sets) => {
            // default value
            sets.forEach((s) => (s.type = s.type || ENamedSetType.NAMEDSET));
            return sets;
        });
    }
    static listNamedSetsAsOptions(idType = null) {
        return RestStorageUtils.listNamedSets(idType).then((namedSets) => namedSets.map((d) => ({ name: d.name, value: d.id })));
    }
    static saveNamedSet(name, idType, ids, subType, description = '', sec = {}) {
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
    static deleteNamedSet(id) {
        return AppContext.getInstance().sendAPI(`${RestStorageUtils.REST_NAMESPACE}/namedset/${id}`, {}, 'DELETE');
    }
    static editNamedSet(id, data) {
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
    static getAttachment(id) {
        return AppContext.getInstance().getAPIJSON(`${RestStorageUtils.REST_NAMESPACE}/attachment/${id}`);
    }
    /**
     * uploads an attachment file to the TDP server
     * @param {Object} data
     * @returns {Promise<string>} a promise with the attachment id
     */
    static addAttachment(data) {
        return Ajax.send(AppContext.getInstance().api2absURL(`${RestStorageUtils.REST_NAMESPACE}/attachment/`), data, 'POST', 'text', 'json');
    }
}
RestStorageUtils.REST_NAMESPACE = `${RestBaseUtils.REST_NAMESPACE}/storage`;
export { RestStorageUtils };
//# sourceMappingURL=rest.js.map