import $ from 'jquery';
import { EventHandler } from 'visyn_core/base';
import 'select2';
import { BaseUtils } from '../../base';
function isSelect3Item(item) {
    return typeof item.verified === 'string';
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
    static highlightMatch(match, p1, offset) {
        return match !== '' ? `<mark>${p1}</mark>` : '';
    }
    static splitEscaped(value, reg, unescape) {
        const elems = value.split(reg);
        const seps = value.match(reg) || [];
        const r = [];
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
    static escapeRegex(re) {
        const reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
        const reHasRegExpChar = RegExp(reRegExpChar.source);
        return re && reHasRegExpChar.test(re) ? re.replace(reRegExpChar, '\\$&') : re;
    }
    static equalArrays(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        return a.every((ai, i) => ai.id === b[i].id && ai.text === b[i].text);
    }
}
class Select3 extends EventHandler {
    constructor(options = {}) {
        super();
        this.options = {
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
            format: (item, node, mode, currentSearchQuery) => {
                if (mode === 'result' && currentSearchQuery) {
                    return item.text.replace(currentSearchQuery, Select3Utils.highlightMatch);
                }
                return item.text;
            },
            formatGroup: (group, node, currentSearchQuery) => {
                if (currentSearchQuery) {
                    return group.text.replace(currentSearchQuery, Select3Utils.highlightMatch);
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
        this.select2Options = {
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
        this.previousValue = [];
        this.lastSearchQuery = null;
        this.cache = new Map();
        this.cacheItem = new Map();
        // debounce since "clear" is removing one by one
        this.onChange = BaseUtils.debounce(() => {
            const next = this.value;
            if (this.options.equalValues(this.previousValue, next)) {
                return;
            }
            this.fire(Select3.EVENT_SELECT, this.previousValue, (this.previousValue = next));
        }, 20);
        // merge the default options with the given options
        Object.assign(this.options, options);
        // merge our default select2Options
        Object.assign(this.select2Options, {
            width: this.options.width,
            minimumInputLength: this.options.minimumInputLength,
            multiple: this.options.multiple,
            placeholder: this.options.placeholder,
            tags: Boolean(this.options.validate),
            ajax: Object.assign(this.select2Options.ajax, {
                // also override ajax options
                delay: this.options.queryDelay,
            }),
        });
        this.node = this.options.document.createElement('div');
        this.node.innerHTML = `<select ${this.options.multiple ? 'multiple' : ''} ${this.options.required ? 'required' : ''} ${this.options.readonly ? 'readonly' : ''} ${this.options.disabled ? 'disabled' : ''}></select>`;
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
            this.dropFile(this.node.querySelector('.select2-container'));
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
    setSearchQuery(value) {
        // add at the end the default separator to add all and trigger tagging behavior
        value = value.trim() + this.options.defaultTokenSeparator;
        $(this.node).find('input.select2-search__field').val(value).trigger('input');
    }
    get value() {
        const data = this.$select.select2('data');
        return data.filter((d) => d.verified === 'verified').map((d) => d.data);
    }
    set value(value) {
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
        items.forEach((item) => this.$select.select2('trigger', 'select', { data: item }));
        this.$select.on('change', this.onChange);
    }
    dropFile(node) {
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
    loadFile(file) {
        const f = new FileReader();
        f.addEventListener('load', () => {
            const v = String(f.result);
            const data = Select3Utils.splitEscaped(v, this.options.tokenSeparators, false).join(this.options.defaultTokenSeparator); // normalize
            this.setSearchQuery(data);
        });
        f.readAsText(file, 'utf-8');
    }
    reformatItems() {
        const data = this.$select.select2('data');
        const current = Array.from(this.node.querySelectorAll('.select2-selection__choice'));
        current.forEach((node, i) => (node.innerHTML = node.firstElementChild.outerHTML + this.formatItem('selection', data[i], node)));
    }
    formatItem(mode, item, container) {
        const elem = container instanceof $ ? container[0] : container;
        if (!isSelect3Item(item)) {
            return this.options.formatGroup(item, elem, this.lastSearchQuery);
        }
        elem.dataset.verified = item.verified;
        return this.options.format(item, elem, mode, this.lastSearchQuery);
    }
    setBusy(value) {
        this.node.classList.toggle('select3-searching', value);
    }
    static wrap(items) {
        return items.map((data) => ({
            data,
            text: data.text,
            id: data.id,
            verified: 'verified',
        }));
    }
    searchImpl(x, success, failure) {
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
                results: this.options.group(Select3.wrap(items), q, x.data.page),
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
    resolveCachedValue(q, page) {
        if (!this.options.cacheResults) {
            return null;
        }
        return this.cache.get(`${page}@${q}`) || null;
    }
    cacheValue(q, page, r) {
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
    validate(terms) {
        const cached = [];
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
            .then((r) => cached.concat(Select3.wrap(r)))
            .catch((error) => {
            console.error(`error validating results:`, error);
            return cached;
        });
    }
    tokenize(query, _options, addSelection) {
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
            const item = {
                id: text,
                text,
                data: null,
                verified: 'processing',
            };
            addSelection(item);
        });
        this.validate(valid).then((val) => {
            const validated = new Map(val.map((i) => [i.text.toLowerCase(), i]));
            const processing = Array.from(this.node.querySelectorAll('.select2-selection__choice[data-verified=processing]'));
            const items = this.$select.select2('data');
            items.forEach((i) => {
                const original = i.text;
                const v = validated.get(original.toLowerCase());
                const dom = processing.find((d) => d.textContent.endsWith(original));
                if (!v && i.verified !== 'verified') {
                    i.verified = 'invalid';
                }
                else {
                    // remove key
                    validated.delete(i.text.toLowerCase());
                    Object.assign(i, v);
                    const o = i.element;
                    if (o) {
                        // sync option
                        o.value = i.id;
                        o.textContent = i.text;
                    }
                }
                if (dom) {
                    dom.innerHTML = dom.firstElementChild.outerHTML + this.formatItem('selection', i, dom);
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
/**
 * event fired when the selection changes the argument is an array of ISelection objects
 * @see ISelection
 * @type {string}
 */
Select3.EVENT_SELECT = 'select';
export { Select3 };
//# sourceMappingURL=Select3.js.map