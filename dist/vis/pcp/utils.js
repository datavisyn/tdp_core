import d3 from 'd3';
import { merge } from 'lodash';
import { EColumnTypes, ESupportedPlotlyVis } from '../interfaces';
import { resolveColumnValues } from '../layoutUtils';
export function isPCP(s) {
    return s.type === ESupportedPlotlyVis.PCP;
}
const defaultConfig = {
    type: ESupportedPlotlyVis.PCP,
    numColumnsSelected: [],
    catColumnsSelected: [],
};
export function pcpMergeDefaultConfig(columns, config) {
    const merged = merge({}, defaultConfig, config);
    if (merged.numColumnsSelected.length === 0 && columns.length > 1) {
        // TODO: Bug. It is always selecting the last two columns, no matter their type.
        merged.numColumnsSelected.push(columns[columns.length - 1].info);
        merged.numColumnsSelected.push(columns[columns.length - 2].info);
    }
    else if (merged.numColumnsSelected.length === 1 && columns.length > 1) {
        if (columns[columns.length - 1].info.id !== merged.numColumnsSelected[0].id) {
            merged.numColumnsSelected.push(columns[columns.length - 1].info);
        }
        else {
            merged.numColumnsSelected.push(columns[columns.length - 2].info);
        }
    }
    return merged;
}
export async function createPCPTraces(columns, config) {
    if (!config.numColumnsSelected || !config.catColumnsSelected) {
        return {
            plots: [],
            legendPlots: [],
            rows: 0,
            cols: 0,
            errorMessage: 'To create a Parallel Coordinates plot, please select at least 2 columns.',
        };
    }
    const numCols = columns.filter((c) => config.numColumnsSelected.some((d) => c.info.id === d.id) && c.type === EColumnTypes.NUMERICAL);
    const catCols = columns.filter((c) => config.catColumnsSelected.some((d) => c.info.id === d.id) && c.type === EColumnTypes.CATEGORICAL);
    if (numCols.length + catCols.length < 2) {
        return {
            plots: [],
            legendPlots: [],
            rows: 0,
            cols: 0,
            errorMessage: 'To create a Parallel Coordinates plot, please select at least 2 columns.',
        };
    }
    const numColValues = await resolveColumnValues(numCols);
    const catColValues = await resolveColumnValues(catCols);
    const plot = {
        xLabel: null,
        yLabel: null,
        data: {
            dimensions: [
                ...numColValues.map((c, i) => {
                    return {
                        range: [
                            d3.min(c.resolvedValues.map((v) => v.val)),
                            d3.max(c.resolvedValues.map((v) => v.val)),
                        ],
                        label: c.info.name,
                        values: c.resolvedValues.map((v) => v.val),
                    };
                }),
                ...catColValues.map((c) => {
                    const uniqueList = [
                        ...new Set(c.resolvedValues.map((v) => v.val)),
                    ];
                    return {
                        range: [0, uniqueList.length - 1],
                        label: c.info.name,
                        values: c.resolvedValues.map((curr) => uniqueList.indexOf(curr.val)),
                        tickvals: [...uniqueList.keys()],
                        ticktext: uniqueList,
                    };
                }),
            ],
            type: "parcoords",
            line: {
                shape: "spline",
                // @ts-ignore
                opacity: 0.2,
            },
        },
    };
    return {
        plots: [plot],
        legendPlots: [],
        rows: 1,
        cols: 1,
        errorMessage: 'To create a Parallel Coordinates plot, please select at least 2 columns.',
    };
}
//# sourceMappingURL=utils.js.map