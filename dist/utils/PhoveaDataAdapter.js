/**
 * Created by Samuel Gratzl on 20.09.2017.
 */
import { DataCache } from 'phovea_core';
export class PhoveaDataAdapter {
    constructor(datasetId) {
        this.datasetId = datasetId;
        this.data = DataCache.getInstance().get(datasetId);
    }
    async getDesc() {
        const t = await this.data;
        return {
            columns: t.desc.columns.map((c) => Object.assign({
                column: c.column || c.name,
                label: c.name
            }, mapType(c.value))),
            idType: t.idtype.name
        };
    }
    async getRows() {
        const t = await this.data;
        const ids = await t.rows();
        const uids = (await t.rowIds()).dim(0).asList(t.dim[0]);
        const objs = await this.data.then((t) => t.objects());
        return objs.map((o, i) => Object.assign({ id: ids[i], _id: uids[i] }, o));
    }
}
function mapType(v) {
    switch (v.type) {
        case 'real':
        case 'int':
            const vi = v;
            return {
                type: 'number',
                min: vi.range[0],
                max: vi.range[1]
            };
        case 'categorical':
            const vc = v;
            return {
                type: 'categorical',
                categories: vc.categories // internally both are valid
            };
        default:
            return {
                type: 'string'
            };
    }
}
//# sourceMappingURL=PhoveaDataAdapter.js.map