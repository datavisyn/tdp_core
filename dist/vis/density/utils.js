import { merge } from 'lodash';
import { EColumnTypes, ESupportedPlotlyVis, } from '../interfaces';
import { resolveColumnValues, resolveSingleColumn } from '../general/layoutUtils';
export function isDensity(s) {
    return s.type === ESupportedPlotlyVis.DENSITY;
}
const defaultConfig = {
    type: ESupportedPlotlyVis.DENSITY,
    numColumnsSelected: [],
    color: null,
    isOpacityScale: true,
    isSizeScale: false,
    hexRadius: 16,
};
export function densityMergeDefaultConfig(columns, config) {
    const merged = merge({}, defaultConfig, config);
    const numCols = columns.filter((c) => c.type === EColumnTypes.NUMERICAL);
    if (merged.numColumnsSelected.length === 0 && numCols.length > 1) {
        merged.numColumnsSelected.push(numCols[numCols.length - 1].info);
        merged.numColumnsSelected.push(numCols[numCols.length - 2].info);
    }
    else if (merged.numColumnsSelected.length === 1 && numCols.length > 1) {
        if (numCols[numCols.length - 1].info.id !== merged.numColumnsSelected[0].id) {
            merged.numColumnsSelected.push(numCols[numCols.length - 1].info);
        }
        else {
            merged.numColumnsSelected.push(numCols[numCols.length - 2].info);
        }
    }
    return merged;
}
export async function getHexData(columns, numColumnsSelected, colorColumn) {
    const numCols = numColumnsSelected
        .filter((col) => columns.find((c) => c.info.id === col.id))
        .map((c) => columns.find((col) => col.info.id === c.id));
    const numColVals = await resolveColumnValues(numCols);
    const colorColVals = await resolveSingleColumn(colorColumn ? columns.find((col) => col.info.id === colorColumn.id) : null);
    return { numColVals, colorColVals };
}
export function cutHex(path, radius, start, sixths) {
    if (sixths === 6) {
        return path;
    }
    if (sixths === 0 || start > 5) {
        return '';
    }
    const splitPath = path.slice(1, path.length - 1).split(/[l]/);
    const currPos = [0, -radius];
    for (let i = 1; i <= start; i++) {
        currPos[0] += +splitPath[i].split(',')[0];
        currPos[1] += +splitPath[i].split(',')[1];
    }
    let finalString = `m${currPos}`;
    for (let i = 0; i < sixths; i++) {
        finalString += start + 1 + i >= 6 ? '' : `l${splitPath[start + 1 + i]}`;
    }
    if (start + sixths >= 6) {
        finalString += `L 0 -${radius}`;
    }
    finalString += 'L 0 0 z';
    return `${finalString}`;
}
//# sourceMappingURL=utils.js.map