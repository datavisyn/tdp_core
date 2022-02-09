/**
 * Created by Samuel Gratzl on 29.09.2016.
 */

import { ITypeDefinition, IValueTypeEditor, PHOVEA_IMPORTER_ValueTypeUtils, ValueTypeEditor } from './valuetypes';
import { IDTypeManager } from '../idtype';
import { I18nextManager } from '../i18n';
import { PluginRegistry } from '../app';

/**
 * edits the given type definition in place with idtype properties
 * @param definition call by reference argument
 * @return {Promise<R>|Promise}
 */

const EXTENSION_POINT = 'idTypeDetector';

export interface IIDTypeDetector {
  detectIDType: (data: any[], accessor: (row: any) => string, sampleSize: number, options?: { [property: string]: any }) => Promise<number> | number;
}

interface IPluginResult {
  idType: string;
  confidence: number;
}

export class IDTypeUtils {
  static editIDType(definition: ITypeDefinition): Promise<ITypeDefinition> {
    const idtype = (<any>definition).idType || 'Custom';

    return new Promise((resolve) => {
      (async () => {
        const existing = await IDTypeManager.getInstance().listAllIdTypes();
        const existingFiltered = existing.filter((d) => !IDTypeManager.getInstance().isInternalIDType(d));
        const dialog = PHOVEA_IMPORTER_ValueTypeUtils.createDialog(I18nextManager.getInstance().i18n.t('phovea:importer.editIdType'), 'idtype', () => {
          const { value } = <HTMLInputElement>dialog.body.querySelector('input');
          const existingIDType = existingFiltered.find((idType) => idType.id === value);
          const idType = existingIDType ? existingIDType.id : value;

          dialog.hide();
          definition.type = 'idType';
          (<any>definition).idType = idType;

          IDTypeManager.getInstance().resolveIdType(idType);
          resolve(definition);
        });
        dialog.body.innerHTML = `
          <div class="form-group">
            <label for="idType_new">${I18nextManager.getInstance().i18n.t('phovea:importer.dialogLabel')}</label>
            <input type="text" class="form-control" id="idType_new" value="${existingFiltered.some((i) => i.id === idtype) ? '' : idtype}">
          </div>
      `;

        dialog.show();
      })();
    });
  }

  static async guessIDType(def: ITypeDefinition, data: any[], accessor: (row: any) => string) {
    const anyDef: any = def;
    if (typeof anyDef.idType !== 'undefined') {
      return def;
    }

    const pluginPromise = IDTypeUtils.executePlugins(data, accessor, Math.min(data.length, 100));
    const results = await pluginPromise;
    const confidences = results.map((result) => result.confidence);

    const maxConfidence = Math.max(...confidences);

    anyDef.idType = maxConfidence > 0.7 ? results[confidences.indexOf(maxConfidence)].idType : 'Custom';

    return def;
  }

  static async isIDType(name: string, index: number, data: any[], accessor: (row: any) => string, sampleSize: number) {
    // first check if it is number then it cant be an IDType
    const isNumber = PHOVEA_IMPORTER_ValueTypeUtils.numerical().isType(name, index, data, accessor, sampleSize);
    if (isNumber > 0.8) {
      // pretty sure it is a number
      return 0;
    }

    const pluginPromise = IDTypeUtils.executePlugins(data, accessor, sampleSize);
    const results = await pluginPromise;

    const confidences = results.map((result) => result.confidence);

    return Math.max(...confidences);
  }

  static async executePlugins(data: any[], accessor: (row: any) => string, sampleSize: number): Promise<IPluginResult[]> {
    const results = PluginRegistry.getInstance()
      .listPlugins(EXTENSION_POINT)
      .map(async (pluginDesc) => {
        const factory = await pluginDesc.load();
        const options = pluginDesc.options ? pluginDesc.options : null;
        const plugin: IIDTypeDetector = factory.factory();
        const confidence = await plugin.detectIDType(data, accessor, sampleSize, options);
        return {
          idType: pluginDesc.idType,
          confidence,
        };
      });

    return Promise.all(results);
  }

  static parseIDType(def: ITypeDefinition, data: any[], accessor: (row: any, value?: any) => string) {
    // TODO check all ids
    return [];
  }

  static async getMarkup(this: ValueTypeEditor, current: ValueTypeEditor, def: ITypeDefinition): Promise<string> {
    const allIDTypes = await IDTypeManager.getInstance().listAllIdTypes();
    const allNonInternalIDtypes = allIDTypes.filter((idType) => !IDTypeManager.getInstance().isInternalIDType(idType));

    return `<optgroup label="${I18nextManager.getInstance().i18n.t('phovea:importer.optionLabel')}" data-type="${this.id}">
          ${allNonInternalIDtypes
            .map(
              (type) =>
                `<option value="${type.id}" ${current && current.id === this.id && type.name === def.idType ? 'selected="selected"' : ''}>${
                  type.name
                }</option>`,
            )
            .join('\n')}
      </optgroup>`;
  }

  static idType(): IValueTypeEditor {
    return {
      isType: IDTypeUtils.isIDType,
      parse: IDTypeUtils.parseIDType,
      guessOptions: IDTypeUtils.guessIDType,
      edit: IDTypeUtils.editIDType,
      getOptionsMarkup: IDTypeUtils.getMarkup,
    };
  }
}
