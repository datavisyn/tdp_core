import { isSupportType, LocalDataProvider, StringColumn, } from 'lineupjs';
import { StructureImageColumn } from '../structureImage';
/**
 * A data provider which changes the default column width from LineUp
 */
export default class TDPLocalDataProvider extends LocalDataProvider {
    constructor(_data, columns = [], options = {}) {
        super(_data, columns, options);
    }
    instantiateColumn(type, id, desc, typeFactory) {
        // cache the column width because initializing the `type` class mutates the desc object
        const columnWidth = desc.width;
        // create a column instance needed for the `isSupportType(col)`
        // eslint-disable-next-line new-cap
        const col = new type(id, desc, typeFactory);
        // do nothing if column width is already defined, there is a default width set by the column instance, or it is a support type column (e.g., rank, aggregation, selection)
        if (columnWidth >= 0 || (!columnWidth && col.getWidth() >= 0) || isSupportType(col)) {
            return col;
        }
        if (type === StringColumn) {
            col.setWidthImpl(120); // use `setWidthImpl` instead of `setWidth` to avoid triggering an event
        }
        else if (type === StructureImageColumn) {
            col.setWidthImpl(70);
        }
        else {
            col.setWidthImpl(102);
        }
        return col;
    }
}
//# sourceMappingURL=TDPLocalDataProvider.js.map