import { merge, identity } from 'lodash';
import * as d3v3 from 'd3v3';
import { I18nextManager } from 'visyn_core/i18n';
import { ITypeDefinition, ValueTypeEditor, PHOVEA_IMPORTER_ValueTypeUtils } from './valuetype/valuetypes';
import { BaseUtils } from '../base';
import { UserSession } from '../app';
import { IDataDescription } from '../data';

export interface IColumnDefinition {
  name: string;
  column: string | number;
  value: ITypeDefinition;
}

export class ImportUtils {
  static commonFields(name: string) {
    const prefix = `i${BaseUtils.randomId(3)}`;
    return `
      <div class="form-group">
        <label for="${prefix}_name">${I18nextManager.getInstance().i18n.t('phovea:importer.name')}</label>
        <input type="text" class="form-control" id="${prefix}_name" name="name" value="${name}" required="required">
      </div>
      <div class="form-group">
        <label for="${prefix}_desc">${I18nextManager.getInstance().i18n.t('phovea:importer.description')}</label>
        <textarea class="form-control" id="${prefix}_desc" name="desc" rows="3"></textarea>
      </div>`;
  }

  static extractCommonFields($root: d3v3.Selection<any>) {
    return {
      name: $root.select('input[name="name"]').property('value'),
      description: $root.select('textarea[name="desc"]').property('value'),
    };
  }

  static async importTable(editors: ValueTypeEditor[], $root: d3v3.Selection<any>, header: string[], data: string[][], name: string) {
    $root.html(`${ImportUtils.commonFields(name)}
        <table class="table table-striped table-sm">
          <thead>
            <th>${I18nextManager.getInstance().i18n.t('phovea:importer.column')}</th>
            <th>${I18nextManager.getInstance().i18n.t('phovea:importer.type')}</th>
          </thead>
          <tbody>

          </tbody>
        </table>
      `);

    const configPromises = header.map((n, i) => {
      return PHOVEA_IMPORTER_ValueTypeUtils.guessValueType(editors, n, i, data, (row) => row[i]);
    });

    const guessedEditors = await Promise.all(configPromises);
    const config = await Promise.all(
      header.map(async (n, i) => {
        const value = await guessedEditors[i].guessOptions({ type: null }, data, (col) => col[i]);
        const markup = await PHOVEA_IMPORTER_ValueTypeUtils.createTypeEditor(editors, guessedEditors[i], value);
        return {
          column: i,
          name: n,
          color: '#DDDDDD',
          value,
          editor: guessedEditors[i],
          markup,
        };
      }),
    );

    const $rows = $root.select('tbody').selectAll('tr').data(config);

    function getCellMarkup(d) {
      return `
        <td>
          <input type="text" class="form-control" value="${d.name}">
        </td>
        <td class="input-group">
          ${d.markup}
        </td>`;
    }

    const $rowsEnter = $rows.enter().append('tr').html(getCellMarkup);
    $rowsEnter.select('input').on('change', function (d) {
      d.name = this.value;
    });
    $rowsEnter.select('select').on('change', PHOVEA_IMPORTER_ValueTypeUtils.updateType(editors));
    $rowsEnter.select('button').on('click', (d) => {
      d.editor.edit(d.value);
    });
    const common = ImportUtils.extractCommonFields($root);

    return () => ({ data, desc: ImportUtils.toTableDataDescription(config, data, common) });
  }

  static toTableDataDescription(config: IColumnDefinition[], data: any[], common: { name: string; description: string }) {
    // derive all configs
    config = config.filter((c) => (<any>c).editor != null);
    config.forEach((d) => {
      const { editor } = <any>d;
      editor.parse(d.value, data, (row, value?) => {
        if (typeof value !== 'undefined') {
          return (row[d.column] = value);
        }
        return row[d.column];
      });
    });

    // generate config
    let idProperty = config.filter((d) => d.value.type === 'idType')[0];
    if (!idProperty) {
      // create an artificial one
      idProperty = { value: { type: 'idType', idType: 'Custom' }, name: 'IDType', column: '_index' };
      data.forEach((d, i) => (d._index = i));
    }
    const columns = config
      .filter((c) => c !== idProperty)
      .map((c) => {
        const r: IColumnDefinition = merge(<any>{}, c);
        delete (<any>r).editor;
        return r;
      });
    const desc: IDataDescription = {
      type: 'table',
      id: BaseUtils.fixId(common.name + BaseUtils.randomId(2)),
      name: common.name,
      description: common.description,
      creator: UserSession.getInstance().currentUserNameOrAnonymous(),
      ts: Date.now(),
      fqname: `upload/${common.name}`,
      size: [data.length, columns.length],
      idtype: (<any>idProperty).value.idType,
      columns,
      idcolumn: <string>idProperty.column,
    };

    return desc;
  }

  static async importMatrix(editors: ValueTypeEditor[], $root: d3v3.Selection<any>, header: string[], data: string[][], name: string) {
    const prefix = `a${BaseUtils.randomId(3)}`;

    const rows = header.slice(1);
    const cols = data.map((d) => d.shift());

    const dataRange = d3v3.range(rows.length * cols.length);

    function byIndex(i, v?) {
      const m = i % cols.length;
      if (v !== undefined) {
        return (data[(i - m) / cols.length][m] = v);
      }
      return data[(i - m) / cols.length][m];
    }

    const editor = await PHOVEA_IMPORTER_ValueTypeUtils.guessValueType(editors, 'value', -1, dataRange, byIndex);
    const configs = [
      {
        column: -1,
        name: I18nextManager.getInstance().i18n.t('phovea:importer.rowName'),
        value: {
          type: 'idType',
        },
        editor: editors.filter((e) => e.id === 'idType')[0],
      },
      {
        column: -1,
        name: I18nextManager.getInstance().i18n.t('phovea:importer.columnName'),
        value: {
          type: 'idType',
        },
        editor: editors.filter((e) => e.id === 'idType')[0],
      },
      {
        column: -1,
        name: I18nextManager.getInstance().i18n.t('phovea:importer.value'),
        value: {
          type: null,
        },
        editor,
      },
    ];

    const $rows = $root.html(ImportUtils.commonFields(name)).selectAll('div.field').data(configs);
    $rows
      .enter()
      .append('div')
      .classed('form-group', true)
      .html(
        (d, i) => `
          <label for="${prefix}_${i}">${d.name}</label>
          <div class="input-group">
            <select class="form-control" ${i < 2 ? 'disabled="disabled"' : ''} id="${prefix}_${i}">
              ${editors.map((e) => `<option value="${e.id}" ${d.value.type === e.id ? 'selected="selected"' : ''}>${e.name}</option>`).join('\n')}
            </select>
            <span class="input-group-btn"><button class="btn btn-light" ${
              !d.editor.hasEditor ? 'disabled="disabled' : ''
            } type="button"><i class="fas fa-cog"></i></button></span>
          </div>`,
      );

    $rows.select('select').on('change', PHOVEA_IMPORTER_ValueTypeUtils.updateType(editors, false));
    $rows.select('button').on('click', (d, i) => {
      if (i < 2) {
        d.editor.guessOptions(d.value, i === 0 ? rows : cols, identity);
      } else {
        d.editor.guessOptions(d.value, dataRange, byIndex);
      }
      d.editor.edit(d.value);
    });

    // parse data
    // TODO set rows and cols
    configs[0].editor.parse(configs[0].value, rows, identity);
    configs[1].editor.parse(configs[1].value, cols, identity);
    configs[2].editor.parse(configs[2].value, dataRange, byIndex);

    const common = ImportUtils.extractCommonFields($root);

    const desc: IDataDescription = {
      type: 'matrix',
      id: BaseUtils.fixId(common.name + BaseUtils.randomId(3)),
      name: common.name,
      fqname: `upload/${common.name}`,
      creator: UserSession.getInstance().currentUserNameOrAnonymous(),
      ts: Date.now(),
      description: common.description,
      size: [rows.length, cols.length],
      rowtype: (<any>configs[0]).value.idType,
      coltype: (<any>configs[1]).value.idType,
      value: configs[1].value,
    };

    return () => ({ rows, cols, data, desc });
  }
}
