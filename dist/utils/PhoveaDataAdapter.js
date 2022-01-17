import { DataCache } from '../data';
function mapType(v) {
    switch (v.type) {
        case 'real':
        case 'int': {
            const vi = v;
            return {
                type: 'number',
                min: vi.range[0],
                max: vi.range[1],
            };
        }
        case 'categorical': {
            const vc = v;
            return {
                type: 'categorical',
                categories: vc.categories,
            };
        }
        default:
            return {
                type: 'string',
            };
    }
}
export class PhoveaDataAdapter {
    constructor(datasetId) {
        this.datasetId = datasetId;
        this.data = DataCache.getInstance().get(datasetId);
    }
    async getDesc() {
        const t = await this.data;
        return {
            columns: t.desc.columns.map((c) => ({
                column: c.column || c.name,
                label: c.name,
                ...mapType(c.value),
            })),
            idType: t.idtype.name,
        };
    }
    async getRows() {
        const t = await this.data;
        const ids = await t.rows();
        const uids = (await t.rowIds()).dim(0).asList(t.dim[0]);
        const objs = await this.data.then((d) => d.objects());
        return objs.map((o, i) => ({ id: ids[i], _id: uids[i], ...o }));
    }
}
//# sourceMappingURL=PhoveaDataAdapter.js.map