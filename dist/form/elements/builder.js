import { RestBaseUtils } from '../../base/rest';
import { FormElementType } from '../interfaces';
export class NameLookupUtils {
    /**
     * utility to create a name lookup select2 field
     * @param {string} database
     * @param {string} table
     * @param {Partial<INameLookupOptions>} options
     * @returns {IFormElementDesc}
     */
    static nameLookupDesc(database, table, options = {}) {
        const { formID, label, multiple, column, view, required, params, useSession } = {
            formID: table,
            label: `${table[0].toUpperCase()}${table.slice(1)}`,
            multiple: false,
            column: 'name',
            required: true,
            view: `${table}_items`,
            params: {},
            useSession: false,
            ...options,
        };
        return {
            type: multiple ? FormElementType.SELECT2_MULTIPLE : FormElementType.SELECT2,
            label,
            id: formID,
            attributes: {
                style: 'width:100%',
            },
            required,
            options: {
                optionsData: [],
                ajax: {
                    url: RestBaseUtils.getTDPLookupUrl(database, view),
                    data: (query) => {
                        return { column, query: query.term === undefined ? '' : query.term, page: query.page === undefined ? 0 : query.page, ...params };
                    },
                },
            },
            useSession,
        };
    }
}
//# sourceMappingURL=builder.js.map