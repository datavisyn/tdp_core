/**
 * Created by Samuel Gratzl on 20.09.2017.
 */
import {ITable, ITableColumn, DataCache} from 'phovea_core';
import {ICategoricalValueTypeDesc, INumberValueTypeDesc, IValueTypeDesc} from 'phovea_core';
import {IRow, IServerColumnDesc} from '../rest';

export class PhoveaDataAdapter {
  private readonly data: Promise<ITable>;

  constructor(private readonly datasetId: string) {
    this.data = <any>DataCache.getInstance().get(datasetId);
  }

  async getDesc(): Promise<IServerColumnDesc> {
    const t = await this.data;
    return {
      columns: t.desc.columns.map((c: ITableColumn<IValueTypeDesc>) => Object.assign({
        column: c.column || c.name,
        label: c.name
      }, mapType(c.value))),
      idType: t.idtype.name
    };
  }

  async getRows(): Promise<IRow[]> {
    const t = await this.data;
    const ids = await t.rows();
    const uids = (await t.rowIds()).dim(0).asList(t.dim[0]);
    const objs = await this.data.then((t) => t.objects());
    return objs.map((o, i) => Object.assign({id: ids[i], _id: uids[i]}, o));
  }
}

function mapType(v: IValueTypeDesc) {
  switch (v.type) {
    case 'real':
    case 'int':
      const vi = <INumberValueTypeDesc>v;
      return {
        type: <'number'>'number',
        min: vi.range[0],
        max: vi.range[1]
      };
    case 'categorical':
      const vc = <ICategoricalValueTypeDesc>v;
      return {
        type: <'categorical'>'categorical',
        categories: <any>vc.categories // internally both are valid
      };
    default:
      return {
        type: <'string'>'string'
      };
  }
}
