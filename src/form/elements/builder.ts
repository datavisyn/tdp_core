import { IParams, RestBaseUtils } from '../../base/rest';
import { FormElementType, IFormElementDesc } from '../interfaces';

export interface INameLookupOptions {
  /**
   * @default <table>
   */
  formID: string;

  /**
   * @default <table.capitalize>
   */
  label: string;

  /**
   * @default false
   */
  multiple: boolean;

  /**
   * @default name
   */
  column: string;

  /**
   * @default <table>_items
   */
  view: string;

  /**
   * @default true
   */
  required: boolean;

  /**
   * @default {}
   */
  params: IParams;

  /**
   * @default false
   */
  useSession: boolean;
}

export class NameLookupUtils {
  /**
   * utility to create a name lookup select2 field
   * @param {string} database
   * @param {string} table
   * @param {Partial<INameLookupOptions>} options
   * @returns {IFormElementDesc}
   */
  static nameLookupDesc(database: string, table: string, options: Partial<INameLookupOptions> = {}): IFormElementDesc {
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
          data: (query: any) => {
            return { column, query: query.term === undefined ? '' : query.term, page: query.page === undefined ? 0 : query.page, ...params };
          },
        },
      },
      useSession,
    };
  }
}
