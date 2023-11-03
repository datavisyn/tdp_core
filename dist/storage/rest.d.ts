import { IDType } from 'visyn_core/idtype';
import { ISecureItem } from 'visyn_core/security';
import { IStoredNamedSet } from './interfaces';
export declare class RestStorageUtils {
    static readonly REST_NAMESPACE: string;
    static listNamedSets(idType?: IDType | string): Promise<IStoredNamedSet[]>;
    static listNamedSetsAsOptions(idType?: IDType | string): Promise<{
        name: string;
        value: string;
    }[]>;
    static saveNamedSet(name: string, idType: IDType | string, ids: string[], subType: {
        key: string;
        value: string;
    }, description?: string, sec?: Partial<ISecureItem>): Promise<any>;
    static deleteNamedSet(id: string): Promise<any>;
    static editNamedSet(id: string, data: {
        [key: string]: any;
    }): Promise<any>;
    /**
     * get the content of an uploaded attachment
     * @param {string} id the attachment id
     * @returns {Promise<object>} the data
     */
    static getAttachment(id: string): Promise<object>;
    /**
     * uploads an attachment file to the TDP server
     * @param {Object} data
     * @returns {Promise<string>} a promise with the attachment id
     */
    static addAttachment(data: object): Promise<string>;
}
//# sourceMappingURL=rest.d.ts.map