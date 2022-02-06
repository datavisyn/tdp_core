import d3 from 'd3';
import { merge } from 'lodash';
import { I18nextManager } from '../../i18n';
import { EColumnTypes, ESupportedPlotlyVis } from '../interfaces';
import { resolveColumnValues } from '../general/layoutUtils';
export function isPCP(s) {
    return s.type === ESupportedPlotlyVis.PCP;
}
const defaultConfig = {
    type: ESupportedPlotlyVis.PCP,
    allColumnsSelected: []
};
export function pcpMergeDefaultConfig(columns, config) {
    const merged = merge({}, defaultConfig, config);
    if (merged.allColumnsSelected.length === 0 && columns.length > 1) {
        // FIXME It is always selecting the last two columns, no matter their type. (@see https://github.com/datavisyn/reprovisyn/issues/199)
        merged.allColumnsSelected.push(columns[columns.length - 1].info);
        merged.allColumnsSelected.push(columns[columns.length - 2].info);
    }
    else if (merged.allColumnsSelected.length === 1 && columns.length > 1) {
        if (columns[columns.length - 1].info.id !== merged.allColumnsSelected[0].id) {
            merged.allColumnsSelected.push(columns[columns.length - 1].info);
        }
        else {
            merged.allColumnsSelected.push(columns[columns.length - 2].info);
        }
    }
    return merged;
}
export async function createPCPTraces(columns, config) {
    if (!config.allColumnsSelected) {
        return {
            plots: [],
            legendPlots: [],
            rows: 0,
            cols: 0,
            errorMessage: I18nextManager.getInstance().i18n.t('tdp:core.vis.pcpError'),
        };
    }
    const allCols = config.allColumnsSelected.map((c) => columns.find((col) => col.info.id === c.id));
    if (config.allColumnsSelected.length < 2) {
        return {
            plots: [],
            legendPlots: [],
            rows: 0,
            cols: 0,
            errorMessage: I18nextManager.getInstance().i18n.t('tdp:core.vis.pcpError'),
        };
    }
    const allColValues = await resolveColumnValues(allCols);
    const plot = {
        xLabel: null,
        yLabel: null,
        data: {
            dimensions: allColValues.map((c, i) => {
                if (c.type === EColumnTypes.NUMERICAL) {
                    return {
                        range: [
                            d3.min(c.resolvedValues.map((v) => v.val)),
                            d3.max(c.resolvedValues.map((v) => v.val)),
                        ],
                        label: c.info.name,
                        values: c.resolvedValues.map((v) => v.val),
                    };
                }
                else {
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
                }
            }),
            type: 'parcoords',
            line: {
                shape: 'spline',
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
        errorMessage: I18nextManager.getInstance().i18n.t('tdp:core.vis.pcpError'),
    };
}
//# sourceMappingURL=utils.js.map