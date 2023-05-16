import { EventHandler } from 'visyn_core/base';
import 'select2';
export interface IdTextPair {
    id: string;
    text: string;
}
/**
 * structure of an item within select3 search box
 */
export interface ISelect3Item<T extends Readonly<IdTextPair>> {
    readonly id: string;
    /**
     * label
     */
    readonly text: string;
    readonly data: T;
    /**
     * valid entry or just a fake one
     */
    verified: 'verified' | 'processing' | 'invalid';
}
export interface ISelect3Group<T extends Readonly<IdTextPair>> {
    readonly text: string;
    readonly children: ISelect3Item<T>[];
}
export interface ISelect3Options<T extends Readonly<IdTextPair>> {
    document: Document;
    /**
     * width of the select element wrapper
     * @default 100%
     */
    width: string;
    /**
     * required flag
     * @default false
     */
    required: boolean;
    /**
     * readonly flag
     * @default false
     */
    readonly: boolean;
    /**
     * disabled flag
     * select is readonly and the value is ignored when submitting the form
     * @default false
     */
    disabled: boolean;
    /**
     * page size to use for searching
     * @default 30
     */
    pageSize: number;
    /**
     * minimal number of characters to enter before first search
     * @default 3
     */
    minimumInputLength: number;
    /**
     * placeholder element
     * @default Search...
     */
    placeholder: string | Readonly<IdTextPair>;
    /**
     * allow multiple entries
     * @default false
     */
    multiple: boolean;
    /**
     * whether files are dropable
     * @default true
     */
    dropable: boolean;
    /**
     * name of the select field
     * @default null
     */
    name: string | null;
    /**
     * id of the select field
     * @default null
     */
    id: string | null;
    /**
     * performs the search
     * @param {string} query the query to search can be ''
     * @param {number} page the page starting with 0 = first page
     * @param {number} pageSize the size of a page
     * @returns {Promise<{ more: boolean, items: IdTextPair[] }>} list of results along with a hint whether more are available
     */
    search(query: string, page: number, pageSize: number): Promise<{
        more: boolean;
        items: Readonly<T>[];
    }>;
    group(items: ISelect3Item<T>[], query: string, page: number): (ISelect3Item<T> | ISelect3Group<T>)[];
    /**
     * validates the given fully queries and returns the matching result subsets
     * @param {string[]} query the list of tokens to validate
     * @returns {Promise<IdTextPair[]>} a list of valid results
     */
    validate: ((query: string[]) => Promise<Readonly<T>[]>) | null;
    /**
     * returns the html to be used for showing this result
     * @param {ISelect3Item<T>} item
     * @param {HTMLElement} node
     * @param {string} mode the kind of formatting that should be done for a result in the dropdown or for an selected item
     * @param {string} currentSearchQuery optional the current search query as a regular expression in which the first group is the matched subset
     * @returns {string} the formatted html text
     */
    format(item: ISelect3Item<T>, node: HTMLElement, mode: 'result' | 'selection', currentSearchQuery?: RegExp): string;
    formatGroup(group: ISelect3Group<T>, node: HTMLElement, currentSearchQuery?: RegExp): string;
    /**
     * define a custom function to check if the two values are the same
     * @param {IdTextPair[]} a
     * @param {IdTextPair[]} b
     * @returns {boolean} whether the two values are equal
     */
    equalValues(a: Readonly<T>[], b: Readonly<T>[]): boolean;
    /**
     * cache fetched results
     */
    cacheResults: boolean;
    /**
     * token separators, spaces, semicolon, colon, escaping is done via the backslash
     * @default /[\s\n\r;,]+/gm
     */
    tokenSeparators?: RegExp;
    /**
     * default token separator
     * @default ' '
     */
    defaultTokenSeparator: string;
    /**
     * Configures the time span how long to wait after a user has stopped typing before sending the AJAX request.
     * @default 250
     */
    queryDelay: number;
}
export declare class Select3Utils {
    /**
     * Replacer function that styles the found match, offset 0 means no match
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
     * @param match The matched substring
     * @param p1 The nth parenthesized submatch string
     * @param offset The offset of the matched substring
     * @returns {string} The replacement string
     */
    static highlightMatch(match: string, p1: string, offset: number): string;
    static splitEscaped(value: string, reg: RegExp, unescape: boolean): string[];
    /**
     * escape the given string to be used as regex
     * @see https://github.com/lodash/lodash/blob/4.1.2-npm-packages/lodash.escaperegexp/index.js
     * @param {string} re the text to be used as regex
     * @returns {string} the escaped text
     */
    static escapeRegex(re: string): string;
    static equalArrays<T extends IdTextPair>(a: T[], b: T[]): boolean;
}
export declare class Select3<T extends IdTextPair> extends EventHandler {
    /**
     * event fired when the selection changes the argument is an array of ISelection objects
     * @see ISelection
     * @type {string}
     */
    static readonly EVENT_SELECT = "select";
    private readonly options;
    private readonly select2Options;
    readonly node: HTMLElement;
    private readonly $select;
    private previousValue;
    private lastSearchQuery;
    private readonly cache;
    private readonly cacheItem;
    private onChange;
    constructor(options?: Partial<ISelect3Options<T>>);
    setSearchQuery(value: string): void;
    get value(): T[];
    set value(value: T[]);
    private dropFile;
    private loadFile;
    reformatItems(): void;
    private formatItem;
    private setBusy;
    private static wrap;
    private searchImpl;
    private resolveCachedValue;
    private cacheValue;
    private validate;
    private tokenize;
    focus(): void;
}
//# sourceMappingURL=Select3.d.ts.map