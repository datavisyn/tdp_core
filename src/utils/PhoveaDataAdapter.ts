import { IRow, IServerColumnDesc } from '../base/rest';
import { DataCache, IValueTypeDesc, INumberValueTypeDesc, ICategoricalValueTypeDesc } from '../data';
import { ITable, ITableColumn } from '../table';

function mapType(v: IValueTypeDesc) {
  switch (v.type) {
    case 'real':
    case 'int': {
      const vi = <INumberValueTypeDesc>v;
      return {
        type: <const>'number',
        min: vi.range[0],
        max: vi.range[1],
      };
    }
    case 'categorical': {
      const vc = <ICategoricalValueTypeDesc>v;
      return {
        type: <const>'categorical',
        categories: <any>vc.categories, // internally both are valid
      };
    }
    default:
      return {
        type: <const>'string',
      };
  }
}

export class PhoveaDataAdapter {
  private readonly data: Promise<ITable>;

  constructor(private readonly datasetId: string) {
    this.data = <any>DataCache.getInstance().get(datasetId);
  }

  async getDesc(): Promise<IServerColumnDesc> {
    const t = await this.data;
    return {
      columns: t.desc.columns.map((c: ITableColumn<IValueTypeDesc>) => ({
        column: c.column || c.name,
        label: c.name,
        ...mapType(c.value),
      })),
      idType: t.idtype.name,
    };
  }

  async getRows(): Promise<IRow[]> {
    const t = await this.data;
    const ids = await t.rows();
    const uids = (await t.rowIds()).dim(0).asList(t.dim[0]);
    const objs = await this.data.then((d) => d.objects());
    return objs.map((o, i) => ({ id: ids[i], _id: uids[i], ...o }));
  }
}
