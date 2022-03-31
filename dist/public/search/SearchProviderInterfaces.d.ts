/// <reference types="react" />
import { FormatOptionLabelMeta } from 'react-select';
import { IPluginDesc } from '../../base';
import { IDType } from '../../idtype';
/**
 * a search result
 */
export interface IResult {
    /**
     * id of the result
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
export interface ISearchProvider<Result extends IResult = IResult> {
    /**
     * performs the search
     * @param {string} query the query to search can be ''
     * @param {number} page the page starting with 0 = first page
     * @param {number} pageSize the size of a page
     * @returns {Promise<{ more: boolean, items: Result[] }>} list of results along with a hint whether more are available
     */
    search(query: string, page: number, pageSize: number): Promise<{
        more: boolean;
        items: Result[];
    }>;
    /**
     * validates the given fully queries and returns the matching result subsets
     * @param {string[]} query the list of tokens to validate
     * @returns {Promise<<Result>[]>} a list of valid results
     */
    validate(query: string[]): Promise<Result[]>;
    produces?(idType: IDType): boolean;
    /**
     * returns result's format for react-select
     * @param option the option to format
     * @param labelMeta provides inputText and context from react-select component
     */
    formatOptionLabel?(option: Result, labelMeta: FormatOptionLabelMeta<Result, true>): React.ReactNode;
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
//# sourceMappingURL=SearchProviderInterfaces.d.ts.map