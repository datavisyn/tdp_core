import $ from 'jquery';
import { EventHandler } from 'visyn_core/base';
import 'select2';
import { BaseUtils } from '../../base';

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

function isSelect3Item(item: ISelect3Item<any> | ISelect3Group<any>): item is ISelect3Item<any> {
  return typeof (<ISelect3Item<any>>item).verified === 'string';
}

interface ISearchResult<T extends Readonly<IdTextPair>> {
  readonly results: (ISelect3Group<T> | ISelect3Item<T>)[];
  readonly pagination: {
    more: boolean;
  };
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
  search(query: string, page: number, pageSize: number): Promise<{ more: boolean; items: Readonly<T>[] }>;

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

export class Select3Utils {
  /**
   * Replacer function that styles the found match, offset 0 means no match
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
   * @param match The matched substring
   * @param p1 The nth parenthesized submatch string
   * @param offset The offset of the matched substring
   * @returns {string} The replacement string
   */
  static highlightMatch(match: string, p1: string, offset: number): string {
    return match !== '' ? `<mark>${p1}</mark>` : '';
  }

  static splitEscaped(value: string, reg: RegExp, unescape: boolean) {
    const elems = value.split(reg);
    const seps = value.match(reg) || [];
    const r: string[] = [];

    while (elems.length > 0) {
      const elem = elems.shift();
      const sep = seps.shift();
      if (elem.endsWith('\\') && elems.length > 0) {
        // next one is an escaped split so merge again together
        const next = elems.shift();
        const full = (unescape ? elem.slice(0, elem.length - 1) : elem) + sep + next;
        elems.unshift(full); // readd again
        continue;
      }
      r.push(elem);
    }
    return r;
  }

  /**
   * escape the given string to be used as regex
   * @see https://github.com/lodash/lodash/blob/4.1.2-npm-packages/lodash.escaperegexp/index.js
   * @param {string} re the text to be used as regex
   * @returns {string} the escaped text
   */
  static escapeRegex(re: string) {
    const reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
    const reHasRegExpChar = RegExp(reRegExpChar.source);
    return re && reHasRegExpChar.test(re) ? re.replace(reRegExpChar, '\\$&') : re;
  }

  static equalArrays<T extends IdTextPair>(a: T[], b: T[]) {
    if (a.length !== b.length) {
      return false;
    }
    return a.every((ai, i) => ai.id === b[i].id && ai.text === b[i].text);
  }
}

export class Select3<T extends IdTextPair> extends EventHandler {
  /**
   * event fired when the selection changes the argument is an array of ISelection objects
   * @see ISelection
   * @type {string}
   */
  static readonly EVENT_SELECT = 'select';

  private readonly options: Readonly<ISelect3Options<T>> = {
    document,
    width: '100%',
    required: false,
    readonly: false,
    disabled: false,
    pageSize: 30,
    minimumInputLength: 0,
    multiple: false,
    dropable: true,
    placeholder: 'Search...',
    validate: null,
    search: () => Promise.resolve({ more: false, items: [] }),
    group: (items) => items,
    format: (item: ISelect3Item<T>, node: HTMLElement, mode: 'result' | 'selection', currentSearchQuery?: RegExp) => {
      if (mode === 'result' && currentSearchQuery) {
        return item.text.replace(currentSearchQuery!, Select3Utils.highlightMatch);
      }
      return item.text;
    },
    formatGroup: (group: ISelect3Group<T>, node: HTMLElement, currentSearchQuery?: RegExp) => {
      if (currentSearchQuery) {
        return group.text.replace(currentSearchQuery!, Select3Utils.highlightMatch);
      }
      return group.text;
    },
    equalValues: Select3Utils.equalArrays,
    cacheResults: true,
    tokenSeparators: /[\s\n\r;,]+/gm,
    defaultTokenSeparator: ' ',
    id: null,
    name: null,
    queryDelay: 250,
  };

  private readonly select2Options: Select2Options = <any>{
    theme: 'bootstrap',
    tokenizer: this.tokenize.bind(this),
    tokenSeparators: [' '],
    createTag: () => null,
    escapeMarkup: String,
    allowClear: true,
    templateResult: this.formatItem.bind(this, 'result'),
    templateSelection: this.formatItem.bind(this, 'selection'),
    ajax: {
      url: '',
      dataType: 'json',
      delay: this.options.queryDelay,
      cache: true,
      transport: this.searchImpl.bind(this),
    },
  };

  readonly node: HTMLElement;

  private readonly $select: JQuery;

  private previousValue: T[] = [];

  private lastSearchQuery: RegExp | null = null;

  private readonly cache = new Map<string, ISearchResult<T>>();

  private readonly cacheItem = new Map<string, ISelect3Item<T>>();

  // debounce since "clear" is removing one by one
  private onChange = BaseUtils.debounce(() => {
    const next = this.value;
    if (this.options.equalValues(this.previousValue, next)) {
      return;
    }
    this.fire(Select3.EVENT_SELECT, this.previousValue, (this.previousValue = next));
  }, 20);

  constructor(options: Partial<ISelect3Options<T>> = {}) {
    super();
    // merge the default options with the given options
    Object.assign(this.options, options);

    // merge our default select2Options
    Object.assign(this.select2Options, {
      width: this.options.width,
      minimumInputLength: this.options.minimumInputLength,
      multiple: this.options.multiple,
      placeholder: this.options.placeholder,
      tags: Boolean(this.options.validate), // only if a validate method is there
      ajax: Object.assign(this.select2Options.ajax, {
        // also override ajax options
        delay: this.options.queryDelay,
      }),
    });

    this.node = this.options.document.createElement('div');
    this.node.innerHTML = `<select ${this.options.multiple ? 'multiple' : ''} ${this.options.required ? 'required' : ''} ${
      this.options.readonly ? 'readonly' : ''
    } ${this.options.disabled ? 'disabled' : ''}></select>`;
    this.node.classList.add('select3');
    this.$select = $('select', this.node);

    if (this.options.name != null) {
      this.$select.attr('name', this.options.name);
    }
    if (this.options.id != null) {
      this.$select.attr('id', this.options.id);
    }

    this.$select.on('change', this.onChange);
    this.$select.select2(this.select2Options);
    if (this.options.validate && this.options.dropable) {
      this.dropFile(<HTMLElement>this.node.querySelector('.select2-container'));
    }

    this.node.addEventListener('paste', (evt) => {
      // see https://jsfiddle.net/GertG/99t5d5vf/
      // the browser normalizes copy-paste data by its own but to avoid that we do it ourselves
      const value = evt.clipboardData ? evt.clipboardData.getData('Text') : '';
      if (!value) {
        return undefined;
      }
      const data = Select3Utils.splitEscaped(value, this.options.tokenSeparators, false).join(this.options.defaultTokenSeparator); // normalize
      this.setSearchQuery(data);
      evt.preventDefault();
      evt.stopPropagation();
      return false;
    });
  }

  setSearchQuery(value: string) {
    // add at the end the default separator to add all and trigger tagging behavior
    value = value.trim() + this.options.defaultTokenSeparator;
    $(this.node).find('input.select2-search__field').val(value).trigger('input');
  }

  get value(): T[] {
    const data: ISelect3Item<T>[] = this.$select.select2('data');
    return data.filter((d) => d.verified === 'verified').map((d) => d.data);
  }

  set value(value: T[]) {
    const old = this.value;
    if (this.options.equalValues(old, value)) {
      return;
    }
    this.previousValue = value;
    this.$select.off('change', this.onChange);

    const items = Select3.wrap(value);
    if (this.options.cacheResults) {
      items.forEach((d) => this.cacheItem.set(d.text.toLowerCase(), d));
    }
    // reset
    this.$select.val(null).trigger('change');
    // add all
    items.forEach((item) => this.$select.select2('trigger', 'select', <any>{ data: item }));
    this.$select.on('change', this.onChange);
  }

  private dropFile(node: HTMLElement) {
    node.addEventListener('dragover', (evt) => {
      if (evt.dataTransfer.types.indexOf('Files') < 0) {
        // no file
        return;
      }
      evt.stopPropagation();
      evt.preventDefault();
      node.classList.add('drag-over');
      evt.dataTransfer.effectAllowed = 'copy';
    });
    node.addEventListener('dragleave', () => {
      node.classList.remove('drag-over');
    });
    node.addEventListener('drop', (evt) => {
      node.classList.remove('drag-over');
      const { files } = evt.dataTransfer;
      if (files.length > 0) {
        // mark success
        evt.stopPropagation();
        evt.preventDefault();
        this.loadFile(files[0]);
      }
    });
  }

  private loadFile(file: File) {
    const f = new FileReader();
    f.addEventListener('load', () => {
      const v = String(f.result);
      const data = Select3Utils.splitEscaped(v, this.options.tokenSeparators, false).join(this.options.defaultTokenSeparator); // normalize
      this.setSearchQuery(data);
    });
    f.readAsText(file, 'utf-8');
  }

  reformatItems() {
    const data: ISelect3Item<T>[] = this.$select.select2('data');
    const current = Array.from(this.node.querySelectorAll('.select2-selection__choice'));
    current.forEach(
      (node: HTMLElement, i) => (node.innerHTML = (<HTMLElement>node.firstElementChild!).outerHTML + this.formatItem('selection', data[i], node)),
    );
  }

  private formatItem(mode: 'result' | 'selection', item: ISelect3Item<T> | ISelect3Group<T>, container: HTMLElement | JQuery) {
    const elem = container instanceof $ ? container[0] : container;
    if (!isSelect3Item(item)) {
      return this.options.formatGroup(item, elem, this.lastSearchQuery);
    }
    elem.dataset.verified = item.verified;
    return this.options.format(item, elem, mode, this.lastSearchQuery);
  }

  private setBusy(value: boolean) {
    this.node.classList.toggle('select3-searching', value);
  }

  private static wrap<T extends Readonly<IdTextPair>>(items: T[]): ISelect3Item<T>[] {
    return items.map((data: T) => ({
      data,
      text: data.text,
      id: data.id,
      verified: <const>'verified',
    }));
  }

  private searchImpl(x: { data: { q: string; page: number } }, success: (data: ISearchResult<T>) => void, failure: () => void) {
    const { q } = x.data;
    this.lastSearchQuery = new RegExp(`(${Select3Utils.escapeRegex(q)})`, 'im');
    if (x.data.page === undefined) {
      x.data.page = 0; // init properly otherwise select2 will assume 1 instead of zero based
    }
    // dummy wrapper for select2
    const result = {
      status: 0,
    };
    const cachedValue = this.resolveCachedValue(q, x.data.page);
    if (cachedValue) {
      success(cachedValue);
      return result;
    }
    this.setBusy(true);
    this.options
      .search(q, x.data.page, this.options.pageSize)
      .then(({ items, more }) => {
        this.setBusy(false);
        const r = {
          results: this.options.group(Select3.wrap<T>(items), q, x.data.page),
          pagination: {
            more,
          },
        };
        this.cacheValue(q, x.data.page, r);
        success(r);
      })
      .catch((error) => {
        console.error(`error fetching search results`, error);
        this.setBusy(false);
        failure();
      });
    return result;
  }

  private resolveCachedValue(q: string, page: number): ISearchResult<T> | null {
    if (!this.options.cacheResults) {
      return null;
    }
    return this.cache.get(`${page}@${q}`) || null;
  }

  private cacheValue(q: string, page: number, r: ISearchResult<T>) {
    if (!this.options.cacheResults) {
      return;
    }
    r.results.forEach((s) => {
      if (isSelect3Item(s)) {
        this.cacheItem.set(s.text.toLowerCase(), s);
      }
    });
    this.cache.set(`${page}@${q}`, r);
  }

  private validate(terms: string[]): Promise<ISelect3Item<T>[]> {
    const cached = <ISelect3Item<T>[]>[];
    if (this.options.cacheResults && this.cacheItem.size > 0) {
      terms = terms.filter((term) => {
        const c = this.cacheItem.get(term.toLowerCase());
        if (c) {
          cached.push(c);
        }
        return !c;
      });
    }
    if (terms.length <= 0) {
      // all cached
      return Promise.resolve(cached);
    }
    return this.options
      .validate(terms)
      .then((r) => cached.concat(Select3.wrap<T>(r)))
      .catch((error) => {
        console.error(`error validating results:`, error);
        return cached;
      });
  }

  private tokenize(query: { term: string }, _options: any, addSelection: (item: ISelect3Item<T>) => void) {
    const { term } = query;
    if (term.length === 0) {
      return query;
    }
    const arr = Select3Utils.splitEscaped(term, this.options.tokenSeparators, true);
    // filter to valid (non empty) entries
    const valid = Array.from(new Set(arr.map((a) => a.trim().toLowerCase()).filter((a) => a.length > 0)));

    if (arr.length <= 1) {
      return query; // single term
    }

    // multiple terms validate all and return empty string

    this.setBusy(true);
    valid.forEach((text) => {
      const item: ISelect3Item<T> = {
        id: text,
        text,
        data: null,
        verified: 'processing',
      };
      addSelection(item);
    });
    this.validate(valid).then((val) => {
      const validated = new Map(val.map((i) => <[string, ISelect3Item<T>]>[i.text.toLowerCase(), i]));
      const processing = Array.from(this.node.querySelectorAll('.select2-selection__choice[data-verified=processing]'));
      const items = <ISelect3Item<T>[]>this.$select.select2('data');
      items.forEach((i) => {
        const original = i.text;
        const v = validated.get(original.toLowerCase());
        const dom = <HTMLElement>processing.find((d) => d.textContent.endsWith(original));
        if (!v && i.verified !== 'verified') {
          i.verified = 'invalid';
        } else {
          // remove key
          validated.delete(i.text.toLowerCase());
          Object.assign(i, v);
          const o = <HTMLOptionElement>(<any>i).element;
          if (o) {
            // sync option
            o.value = i.id;
            o.textContent = i.text;
          }
        }
        if (dom) {
          dom.innerHTML = (<HTMLElement>dom.firstElementChild!).outerHTML + this.formatItem('selection', i, dom);
        }
      });
      // add remaining
      validated.forEach((i) => addSelection(i));
      this.onChange(); // since the processing thus value changed
      this.setBusy(false);
    });

    return {
      term: '',
    };
  }

  focus() {
    this.$select.select2('open');
  }
}
