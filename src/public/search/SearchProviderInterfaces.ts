import {IPluginDesc} from '../../base';
import {IDType} from '../../idtype';

/**
 * a search result
 */
export interface IResult {
  /**
   * id of this result
   */
  readonly _id: number;
  /**
   * the name for _id
   */
  readonly id: string;
  /**
   * label of this result
   */
  readonly text: string;

  readonly idType?: IDType;
}

/**
 * a search provider extension provides
 */
export interface ISearchProvider {
  /**
   * performs the search
   * @param {string} query the query to search can be ''
   * @param {number} page the page starting with 0 = first page
   * @param {number} pageSize the size of a page
   * @returns {Promise<{ more: boolean, items: IResult[] }>} list of results along with a hint whether more are available
   */
  search(query: string, page: number, pageSize: number): Promise<{ more: boolean, items: IResult[] }>;

  /**
   * validates the given fully queries and returns the matching result subsets
   * @param {string[]} query the list of tokens to validate
   * @returns {Promise<IResult[]>} a list of valid results
   */
  validate(query: string[]): Promise<IResult[]>;

  /**
   * returns the html to be used for showing this result
   * @param {IResult} item
   * @param {HTMLElement} node
   * @param {string} mode the kind of formatting that should be done for a result in the dropdown or for an selected item
   * @param {string} currentSearchQuery optional the current search query as a regular expression in which the first group is the matched subset
   * @returns {string} the formatted html text
   */
  format?(item: IResult, node: HTMLElement, mode: 'result'|'selection', currentSearchQuery?: RegExp): string;

  produces?(idType: IDType): boolean;
}

/**
 * additional plugin description fields as defined in phovea.js
 */
export interface ISearchProviderDesc extends IPluginDesc {
  /**
   * id type this provider returns
   */
  idType: string;

  /**
   * name of this search provider (used for the checkbox)
   */
  name: string;
}
