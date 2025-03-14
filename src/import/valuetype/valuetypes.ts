import merge from 'lodash/merge';
import { I18nextManager } from 'visyn_core/i18n';
import { IPlugin, PluginRegistry } from 'visyn_core/plugin';

import { Dialog } from '../../components';

// https://github.com/d3/d3-3.x-api-reference/blob/master/Ordinal-Scales.md#category10
const categoryColors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];

export interface ITypeDefinition {
  type: string;
  [key: string]: any;
}

export interface IValueTypeEditor {
  /**
   * guesses whether the given data is of the given type, returns a confidence value
   * @param name name of the column
   * @param index the index of the column
   * @param data
   * @param accessor
   * @param sampleSize
   * @return the confidence (0 ... not, 1 ... sure) that this is the right value type
   */
  isType(name: string, index: number, data: any[], accessor: (row: any) => string, sampleSize: number): Promise<number> | number;
  /**
   * parses the given value and updates them inplace
   * @return an array containing invalid indices
   */
  parse(def: ITypeDefinition, data: any[], accessor: (row: any, value?: any) => any): number[];
  /**
   * guesses the type definition options
   * @param def
   * @param data
   * @param accessor
   */
  guessOptions(def: ITypeDefinition, data: any[], accessor: (row: any) => any): Promise<ITypeDefinition> | ITypeDefinition;
  /**
   * opens and editor to edit the options
   * @param def
   */
  edit(def: ITypeDefinition);

  /**
   * returns markup to show inside a select box. the markup is either a single option or a whole optgroup with options
   * if it is an optgroup, the editor type is represented as data-type attribute, whereas the subtype is the option's value (e.g. optgroup[data-type=idType], option[value=Ensembl])
   * @param current current editor
   * @param def definition of the editor. E.g. which type the editor is (and which idType the column has if it is an IDTypeEditor)
   */
  getOptionsMarkup(current: ValueTypeEditor, def: ITypeDefinition): Promise<string> | string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export class PHOVEA_IMPORTER_ValueTypeUtils {
  static createDialog(title: string, classSuffix: string, onSubmit: () => any) {
    const dialog = Dialog.generateDialog(title, I18nextManager.getInstance().i18n.t('phovea:importer.save'));
    dialog.body.classList.add(`caleydo-importer-${classSuffix}`);
    const form = dialog.body.ownerDocument.createElement('form');
    dialog.body.appendChild(form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      onSubmit();
    });
    dialog.onHide(() => {
      dialog.destroy();
    });
    dialog.onSubmit(onSubmit);
    return dialog;
  }

  /**
   * edits the given type definition in place with categories
   * @param definition call by reference argument
   * @return {Promise<R>|Promise}
   */
  static editString(definition: ITypeDefinition) {
    const def: any = definition;
    const convert = def.convert || null;
    const regexFrom = def.regexFrom || null;
    const regexTo = def.regexTo || null;

    return new Promise((resolve) => {
      const dialog = PHOVEA_IMPORTER_ValueTypeUtils.createDialog(I18nextManager.getInstance().i18n.t('phovea:importer.editStringConversion'), 'string', () => {
        dialog.hide();
        definition.type = 'string';
        // Circular dependency
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        def.convert = findSelectedRadio();
        def.regexFrom = def.convert === 'regex' ? (<HTMLInputElement>dialog.body.querySelector('input[name="regexFrom"]')).value : null;
        def.regexTo = def.convert === 'regex' ? (<HTMLInputElement>dialog.body.querySelector('input[name="regexTo"]')).value : null;

        resolve(definition);
      });
      dialog.body.innerHTML = `
          <div class="form-group">
            <label>${I18nextManager.getInstance().i18n.t('phovea:importer.textConversion')}</label>

            <div class="radio">
              <label class="radio">
                <input type="radio" name="string-convert" value="" ${!convert ? 'checked="checked"' : ''}> ${I18nextManager.getInstance().i18n.t(
                  'phovea:importer.none',
                )}
              </label>
            </div>
            <div class="radio">
              <label class="radio">
                <input type="radio" name="string-convert" value="toUpperCase" ${
                  convert === 'toUpperCase' ? 'checked="checked"' : ''
                }> ${I18nextManager.getInstance().i18n.t('phovea:importer.upperCase')}
              </label>
            </div>
            <div class="radio">
              <label class="radio">
                <input type="radio" name="string-convert" value="toLowerCase" ${
                  convert === 'toLowerCase' ? 'checked="checked"' : ''
                }> ${I18nextManager.getInstance().i18n.t('phovea:importer.lowerCase')}
              </label>
            </div>
            <div class="radio">
              <label class="radio">
                <input type="radio" name="string-convert" value="regex" ${
                  convert === 'regex"' ? 'checked="checked"' : ''
                }> ${I18nextManager.getInstance().i18n.t('phovea:importer.regexReplacement')}
              </label>
            </div>
            </div>
            <div class="form-group">
              <label for="regexFrom">${I18nextManager.getInstance().i18n.t('phovea:importer.regexSearchExpression')}</label>
              <input type="text" class="form-control" ${convert !== 'regex' ? 'disabled="disabled"' : ''} name="regexFrom" value="${regexFrom || ''}">
            </div>
            <div class="form-group">
              <label for="regexTo">${I18nextManager.getInstance().i18n.t('phovea:importer.regexReplacementExpression')}</label>
              <input type="text" class="form-control"  ${convert !== 'regex' ? 'disabled="disabled"' : ''} name="regexTo" value="${regexTo || ''}">
            </div>
      `;
      const choices = [].slice.apply(dialog.body.querySelectorAll('input[type="radio"]'));
      choices.forEach((e) =>
        e.addEventListener('change', function () {
          const regexSelected = this.checked && this.value === 'regex';
          [].slice.apply(dialog.body.querySelectorAll('input[type="text"]')).forEach((a) => (a.disabled = !regexSelected));
        }),
      );

      function findSelectedRadio() {
        const first = choices.filter((e) => e.checked)[0];
        return first ? first.value : '';
      }

      dialog.show();
    });
  }

  static guessString(def: ITypeDefinition, data: any[], accessor: (row: any) => string) {
    const anyDef: any = def;
    if (typeof anyDef.convert !== 'undefined') {
      return def;
    }
    anyDef.convert = null;
    return def;
  }

  static parseString(def: ITypeDefinition, data: any[], accessor: (row: any, value?: any) => string) {
    const anydef: any = def;
    const regexFrom = new RegExp(anydef.regexFrom);
    const { regexTo } = anydef;

    const lookup = {
      toLowerCase: (d: string) => d.toLowerCase(),
      toUpperCase: (d: string) => d.toUpperCase(),
      regex: (d: string) => d.replace(regexFrom, regexTo),
    };
    const op = lookup[anydef.convert];

    if (!op) {
      return [];
    }

    const invalid = [];
    data.forEach((d, i) => {
      let v = String(accessor(d));
      v = op(v);
      accessor(d, v);
    });
    return invalid;
  }

  static singleOption(this: ValueTypeEditor, current: ValueTypeEditor) {
    return `<option value="${this.id}" ${current && current.id === this.id ? 'selected="selected"' : ''}>${this.name}</option>`;
  }

  static string_(): IValueTypeEditor {
    return {
      isType: () => 1, // always a string
      parse: PHOVEA_IMPORTER_ValueTypeUtils.parseString,
      guessOptions: PHOVEA_IMPORTER_ValueTypeUtils.guessString,
      edit: PHOVEA_IMPORTER_ValueTypeUtils.editString,
      getOptionsMarkup: PHOVEA_IMPORTER_ValueTypeUtils.singleOption,
    };
  }

  /**
   * edits the given type definition in place with categories
   * @param definition call by reference argument
   * @return {Promise<R>|Promise}
   */
  static editCategorical(definition: ITypeDefinition) {
    const cats = (<any>definition).categories || [];

    return new Promise((resolve) => {
      const dialog = PHOVEA_IMPORTER_ValueTypeUtils.createDialog(I18nextManager.getInstance().i18n.t('phovea:importer.editCategories'), 'categorical', () => {
        const text = (<HTMLTextAreaElement>dialog.body.querySelector('textarea')).value;
        const categories = text
          .trim()
          .split('\n')
          .map((row) => {
            const l = row.trim().split('\t');
            return { name: l[0].trim(), color: l.length > 1 ? l[1].trim() : 'gray' };
          });
        dialog.hide();
        definition.type = 'categorical';
        (<any>definition).categories = categories;
        resolve(definition);
      });
      dialog.body.classList.add('caleydo-importer-');
      dialog.body.innerHTML = `
          <textarea class="form-control">${cats.map((cat) => `${cat.name}\t${cat.color}`).join('\n')}</textarea>
      `;
      const textarea = dialog.body.querySelector('textarea');
      // http://stackoverflow.com/questions/6637341/use-tab-to-indent-in-textarea#6637396 enable tab character
      textarea.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.keyCode === 9 || e.which === 9) {
          e.preventDefault();
          const s = textarea.selectionStart;
          textarea.value = `${textarea.value.substring(0, textarea.selectionStart)}\t${textarea.value.substring(textarea.selectionEnd)}`;
          textarea.selectionEnd = s + 1;
        }
      });
      dialog.show();
    });
  }

  static guessCategorical(def: ITypeDefinition, data: any[], accessor: (row: any) => string) {
    const anyDef: any = def;
    if (typeof anyDef.categories !== 'undefined') {
      return def;
    }
    // unique values
    const cache = {};
    data.forEach((row) => {
      const v = accessor(row);
      cache[v] = v;
    });
    anyDef.categories = Object.keys(cache)
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
      .map((cat, i) => ({
        name: cat,
        color: categoryColors[i] || 'gray',
      }));
    return def;
  }

  static isCategorical(name: string, index: number, data: any[], accessor: (row: any) => string, sampleSize: number) {
    const testSize = Math.min(data.length, sampleSize);
    if (testSize <= 0) {
      return 0;
    }
    const categories = {};
    let validSize = 0;
    for (let i = 0; i < testSize; ++i) {
      const v = accessor(data[i]);
      if (PHOVEA_IMPORTER_ValueTypeUtils.isEmptyString(v)) {
        continue; // skip empty samples
      }
      validSize++;
      categories[v] = v;
    }

    const numCats = Object.keys(categories).length;
    return 1 - numCats / validSize;
  }

  static parseCategorical(def: ITypeDefinition, data: any[], accessor: (row: any, value?: any) => string) {
    const categories = ((<any>def).categories || []).map((cat) => cat.name);
    const invalid = [];

    function isValidCategory(v: string) {
      return categories.indexOf(v) >= 0;
    }

    data.forEach((d, i) => {
      const v = accessor(d);
      if (!isValidCategory(v)) {
        invalid.push(i);
      }
    });
    return invalid;
  }

  static categorical(): IValueTypeEditor {
    return {
      isType: PHOVEA_IMPORTER_ValueTypeUtils.isCategorical,
      parse: PHOVEA_IMPORTER_ValueTypeUtils.parseCategorical,
      guessOptions: PHOVEA_IMPORTER_ValueTypeUtils.guessCategorical,
      edit: PHOVEA_IMPORTER_ValueTypeUtils.editCategorical,
      getOptionsMarkup: PHOVEA_IMPORTER_ValueTypeUtils.singleOption,
    };
  }

  /**
   * edits the given type definition in place with numerical properties
   * @param definition call by reference argument
   * @return {Promise<R>|Promise}
   */
  static editNumerical(definition: ITypeDefinition): Promise<ITypeDefinition> {
    const range = (<any>definition).range || [0, 100];

    return new Promise((resolve) => {
      const dialog = PHOVEA_IMPORTER_ValueTypeUtils.createDialog(I18nextManager.getInstance().i18n.t('phovea:importer.editNumerical'), 'numerical', () => {
        const minR = parseFloat((<HTMLInputElement>dialog.body.querySelector('input[name=numerical-min]')).value);
        const maxR = parseFloat((<HTMLInputElement>dialog.body.querySelector('input[name=numerical-max]')).value);
        dialog.hide();
        (<any>definition).range = [minR, maxR];
        resolve(definition);
      });
      dialog.body.innerHTML = `
          <div class="form-group">
            <label for="minRange">${I18nextManager.getInstance().i18n.t('phovea:importer.minimumValue')}</label>
            <input type="number" class="form-control" name="numerical-min" step="any" value="${range[0]}">
          </div>
          <div class="form-group">
            <label for="maxRange">${I18nextManager.getInstance().i18n.t('phovea:importer.maximumValue')}</label>
            <input type="number" class="form-control" name="numerical-max" step="any" value="${range[1]}">
          </div>
      `;
      dialog.show();
    });
  }

  /**
   * Checks if the given value is an empty string
   * @param value Input value
   * @returns Returns a true if the given value is an empty string. Otherwise returns false.
   */
  static isEmptyString(value: any): boolean {
    return value === null || value === undefined || (typeof value === 'string' && value.trim().length === 0);
  }

  /**
   * Checks if the given string is a missing value, i.e., an empty string or NaN.
   * @param value Input string
   * @returns Returns a true if the given value is a missing value. Otherwise returns false.
   */
  static isMissingNumber(value: string) {
    return PHOVEA_IMPORTER_ValueTypeUtils.isEmptyString(value) || value === 'NaN';
  }

  static guessNumerical(def: ITypeDefinition, data: any[], accessor: (row: any) => string) {
    // TODO support different notations, comma vs point
    const anyDef: any = def;
    if (typeof anyDef.range !== 'undefined') {
      return def;
    }
    let minV = NaN;
    let maxV = NaN;
    data.forEach((row) => {
      const raw = accessor(row);
      if (PHOVEA_IMPORTER_ValueTypeUtils.isMissingNumber(raw)) {
        return; // skip
      }
      const v = parseFloat(raw);
      if (Number.isNaN(minV) || v < minV) {
        minV = v;
      }
      if (Number.isNaN(maxV) || v > maxV) {
        maxV = v;
      }
    });
    anyDef.range = [Number.isNaN(minV) ? 0 : minV, Number.isNaN(maxV) ? 100 : maxV];
    return def;
  }

  static isNumerical(name: string, index: number, data: any[], accessor: (row: any) => string, sampleSize: number) {
    const testSize = Math.min(data.length, sampleSize);
    if (testSize <= 0) {
      return 0;
    }
    const isFloat = /^\s*-?(\d*\.?\d+|\d+\.?\d*)(e[-+]?\d+)?\s*$/i;
    let numNumerical = 0;
    let validSize = 0;

    for (let i = 0; i < testSize; ++i) {
      const v = accessor(data[i]);
      if (PHOVEA_IMPORTER_ValueTypeUtils.isMissingNumber(v)) {
        continue; // skip empty samples
      }
      validSize++;
      if (isFloat.test(v) || v === 'NaN') {
        numNumerical += 1;
      }
    }
    return numNumerical / validSize;
  }

  static parseNumerical(def: ITypeDefinition, data: any[], accessor: (row: any, value?: any) => string) {
    const isInt = def.type === 'int';
    const invalid = [];
    const isFloat = /^\s*-?(\d*\.?\d+|\d+\.?\d*)(e[-+]?\d+)?\s*$/i;
    data.forEach((d, i) => {
      const v = accessor(d);
      if (PHOVEA_IMPORTER_ValueTypeUtils.isMissingNumber(v)) {
        accessor(d, NaN);
        return;
      }
      if (!isFloat.test(v)) {
        invalid.push(i);
      } else {
        accessor(d, isInt ? parseInt(v, 10) : parseFloat(v));
      }
    });
    return invalid;
  }

  static numerical(): IValueTypeEditor {
    return {
      isType: PHOVEA_IMPORTER_ValueTypeUtils.isNumerical,
      parse: PHOVEA_IMPORTER_ValueTypeUtils.parseNumerical,
      guessOptions: PHOVEA_IMPORTER_ValueTypeUtils.guessNumerical,
      edit: PHOVEA_IMPORTER_ValueTypeUtils.editNumerical,
      getOptionsMarkup: PHOVEA_IMPORTER_ValueTypeUtils.singleOption,
    };
  }

  static isBoolean(name: string, index: number, data: any[], accessor: (row: any) => string, sampleSize: number) {
    const testSize = Math.min(data.length, sampleSize);
    if (testSize <= 0) {
      return 0;
    }
    const categories = {};
    let validSize = 0;
    for (let i = 0; i < testSize; ++i) {
      const v = accessor(data[i]);
      if (typeof v !== 'boolean' || v === null || v === undefined) {
        continue; // skip empty samples
      }
      validSize++;
      categories[v] = v;
    }

    const numCats = Object.keys(categories).length;
    return 1 - numCats / validSize;
  }

  static boolean(): IValueTypeEditor {
    return {
      isType: PHOVEA_IMPORTER_ValueTypeUtils.isBoolean,
      parse: PHOVEA_IMPORTER_ValueTypeUtils.parseCategorical,
      guessOptions: PHOVEA_IMPORTER_ValueTypeUtils.guessCategorical,
      edit: PHOVEA_IMPORTER_ValueTypeUtils.editCategorical,
      getOptionsMarkup: PHOVEA_IMPORTER_ValueTypeUtils.singleOption,
    };
  }

  /**
   * guesses the value type returning a string
   * @param editors the possible types
   * @param name the name of the column/file for helper
   * @param index the index of this column
   * @param data the data
   * @param accessor to access the column
   * @param options additional options
   * @return {any}
   */
  static async guessValueType(
    editors: ValueTypeEditor[],
    name: string,
    index: number,
    data: any[],
    accessor: (row: any) => any,
    options: IGuessOptions = {},
  ): Promise<ValueTypeEditor> {
    options = merge(
      {
        sampleSize: 100,
        thresholds: <any>{
          numerical: 0.7,
          categorical: 0.7,
          real: 0.7,
          int: 0.7,
        },
      },
      options,
    );
    const testSize = Math.min(options.sampleSize, data.length);

    // one promise for each editor for a given column
    const promises = editors.map((editor) => editor.isType(name, index, data, accessor, testSize));

    const confidenceValues = await Promise.all(promises);

    let results = editors.map((editor, i) => ({
      type: editor.id,
      editor,
      confidence: confidenceValues[i],
      priority: editor.priority,
    }));

    // filter all 0 confidence ones by its threshold
    results = results.filter((r) => (typeof options.thresholds[r.type] !== 'undefined' ? r.confidence >= options.thresholds[r.type] : r.confidence > 0));

    if (results.length <= 0) {
      return null;
    }
    // order by priority (less more important)
    results = results.sort((a, b) => a.priority - b.priority);
    // choose the first one
    return results[0].editor;
  }

  static async createTypeEditor(editors: ValueTypeEditor[], current: ValueTypeEditor, def: ITypeDefinition, emptyOne = true) {
    const optionsPromises = editors.map((editor) => editor.getOptionsMarkup(current, def));
    const options = await Promise.all(optionsPromises);

    return `<select class="form-control">
          ${emptyOne ? '<option value=""></option>' : ''}
          ${options.join('\n')}
      </select>
      <span class="input-group-btn">
        <button class="btn btn-light" ${!current || !current.hasEditor ? 'disabled="disabled' : ''} type="button"><i class="fas fa-cog"></i></button>
      </span>`;
  }

  static updateType(editors: ValueTypeEditor[], emptyOne = true) {
    return function (d) {
      const parent = this.options[this.selectedIndex].parentNode;

      let type = null;
      if (parent.nodeName !== 'OPTGROUP') {
        type = editors.find((editor) => editor.id === this.value) || null;
      } else {
        // find type based on the surrounding optgroup
        // the type of the editor is saved as the data-type of the optgroup, the value is the subtype (e.g. idType)
        type = editors.find((editor) => editor.id === parent.dataset.type) || null;
        d.value[parent.dataset.type] = this.value;
      }

      d.value.type = type ? type.id : '';
      d.editor = type;
      const configure = <HTMLButtonElement>this.parentElement.querySelector('button');

      if (!type || !type.hasEditor) {
        configure.classList.add('disabled');
        configure.disabled = true;
      } else {
        configure.classList.remove('disabled');
        configure.disabled = false;
      }
      const isIDType = !type || type.isImplicit;
      const tr = this.parentElement.parentElement;

      tr.className = isIDType ? 'info' : '';
      const input = tr.querySelector('input');
      if (input) {
        (<HTMLInputElement>input).disabled = isIDType;
      }
    };
  }
}
export class ValueTypeEditor implements IValueTypeEditor {
  private desc: any;

  private impl: IValueTypeEditor;

  constructor(impl: IPlugin) {
    this.desc = impl.desc;
    this.impl = impl.factory();
  }

  get hasEditor() {
    return this.impl.edit != null;
  }

  get isImplicit() {
    return this.desc.implicit === true;
  }

  get priority() {
    return typeof this.desc.priority !== 'undefined' ? this.desc.priority : 100;
  }

  get name() {
    return this.desc.name;
  }

  get id() {
    return this.desc.id;
  }

  isType(name: string, index: number, data: any[], accessor: (row: any) => string, sampleSize: number) {
    return this.impl.isType(name, index, data, accessor, sampleSize);
  }

  parse(def: ITypeDefinition, data: any[], accessor: (row: any, value?: any) => any): number[] {
    def.type = this.id;
    this.impl.guessOptions(def, data, accessor);
    return this.impl.parse(def, data, accessor);
  }

  guessOptions(def: ITypeDefinition, data: any[], accessor: (row: any) => any) {
    def.type = this.id;
    return this.impl.guessOptions(def, data, accessor);
  }

  edit(def: ITypeDefinition) {
    def.type = this.id;
    return this.impl.edit(def);
  }

  getOptionsMarkup(current: ValueTypeEditor, def: ITypeDefinition) {
    return this.impl.getOptionsMarkup.call(this, current, def);
  }

  static createCustomValueTypeEditor(name: string, id: string, implicit: boolean, desc: IValueTypeEditor) {
    return new ValueTypeEditor(<any>{
      desc: {
        name,
        id,
        implicit,
      },
      factory: () => desc,
    });
  }

  static EXTENSION_POINT = 'importer_value_type';

  static createValueTypeEditor(id: string): Promise<ValueTypeEditor> {
    const p = PluginRegistry.getInstance().getPlugin(ValueTypeEditor.EXTENSION_POINT, id);
    if (!p) {
      return Promise.reject(`not found: ${id}`);
    }
    return p.load().then((impl) => new ValueTypeEditor(impl));
  }

  static createValueTypeEditors(): Promise<ValueTypeEditor[]> {
    return PluginRegistry.getInstance()
      .loadPlugin(
        PluginRegistry.getInstance()
          .listPlugins(ValueTypeEditor.EXTENSION_POINT)
          .sort((a, b) => a.name.localeCompare(b.name)),
      )
      .then((impls) => impls.map((i) => new ValueTypeEditor(i)));
  }
}

export interface IGuessOptions {
  /**
   * number of samples considered
   */
  sampleSize?: number; // 100
  /**
   * threshold if more than X percent of the samples are numbers it will be detected as number
   * numerical - 0.7
   * categorical - 0.7
   */
  thresholds?: { [type: string]: number };
}
