import {merge} from 'lodash';
import {VisCategoricalColumn, ColumnInfo, EColumnTypes, ESupportedPlotlyVis, IVisConfig, VisNumericalColumn, Scales} from '../interfaces';
import {PlotlyInfo, PlotlyData} from '../interfaces';
import {getCol} from '../sidebar/utils';

export enum EBarDisplayType {
    DEFAULT = 'Default',
    NORMALIZED = 'Normalized',
}

export enum EBarDirection {
    VERTICAL = 'Vertical',
    HORIZONTAL = 'Horizontal',
}

export enum EViolinOverlay {
    NONE = 'None',
    STRIP = 'Strip',
    BOX = 'Box'
}

export enum EBarGroupingType {
    STACK = 'Stacked',
    GROUP = 'Grouped',
}

export function isBar(s: IVisConfig): s is IBarConfig {
    return s.type === ESupportedPlotlyVis.BAR;
}

export interface IBarConfig {
    type: ESupportedPlotlyVis.BAR;
    multiples: ColumnInfo | null;
    group: ColumnInfo | null;
    direction: EBarDirection;
    display: EBarDisplayType;
    groupType: EBarGroupingType;
    numColumnsSelected: ColumnInfo[];
    catColumnsSelected: ColumnInfo[];
}

const defaultConfig: IBarConfig = {
    type: ESupportedPlotlyVis.BAR,
    numColumnsSelected: [],
    catColumnsSelected: [],
    group: null,
    groupType: EBarGroupingType.STACK,
    multiples: null,
    display: EBarDisplayType.DEFAULT,
    direction: EBarDirection.VERTICAL,
};

export function barMergeDefaultConfig(
    columns: VisColumn[],
    config: IBarConfig
): IVisConfig {
    const merged = merge({}, defaultConfig, config);

    const catCols = columns.filter((c) => c.type === EColumnTypes.CATEGORICAL);

    if(merged.catColumnsSelected.length === 0 && catCols.length > 0) {
        merged.catColumnsSelected.push(catCols[catCols.length - 1].info);
    }

    return merged;
}


export function createBarTraces(
    columns: VisColumn[],
    config: IBarConfig,
    scales: Scales,
): PlotlyInfo {
    let plotCounter = 1;

    if(!config.catColumnsSelected) {
        return {
            plots: [],
            legendPlots: [],
            rows: 0,
            cols: 0,
            errorMessage: 'To create a Bar Chart, please select at least 1 categorical column.',
        };
    }

    const plots: PlotlyData[] = [];

    const catCols: VisCategoricalColumn[] = columns.filter((c) => config.catColumnsSelected.some((d) => c.info.id === d.id) && c.type === EColumnTypes.CATEGORICAL) as VisCategoricalColumn[];

    if(catCols.length > 0) {

        if(config.group && config.multiples) {
            plotCounter = setPlotsWithGroupsAndMultiples(columns, config, plots, scales, plotCounter);
        } else if(config.group) {
            plotCounter = setPlotsWithGroups(columns, config, plots, scales, plotCounter);
        } else if(config.multiples) {
            plotCounter = setPlotsWithMultiples(columns, config, plots, scales, plotCounter);
        } else {
            plotCounter = setPlotsBasic(columns, config, plots, scales, plotCounter);
        }
    }

    const rows = Math.ceil(Math.sqrt(plotCounter - 1));
    const cols = Math.ceil((plotCounter - 1) / rows);

    return {
        plots,
        legendPlots: [],
        rows,
        cols,
        errorMessage: 'To create a Bar Chart, please select at least 1 categorical column.',
    };
}

function setPlotsWithGroupsAndMultiples(columns, config, plots, scales, plotCounter): number {

    const catCols: VisCategoricalColumn[] = columns.filter((c) => config.catColumnsSelected.filter((d) => c.info.id === d.id).length > 0 && c.type === EColumnTypes.CATEGORICAL) as VisCategoricalColumn[];
    const vertFlag = config.direction === EBarDirection.VERTICAL;
    const normalizedFlag = config.display === EBarDisplayType.NORMALIZED;
    const catCurr = catCols[0];
    const currGroupColumn = getCol(columns, config.group) as VisCategoricalColumn;
    const currMultiplesColumn = getCol(columns, config.multiples) as VisCategoricalColumn;


    const uniqueGroupVals = [...new Set(currGroupColumn.values.map((v) => v.val))];
    const uniqueMultiplesVals = [...new Set(currMultiplesColumn.values.map((v) => v.val))];

    const uniqueColVals = [...new Set(catCurr.values.map((v) => v.val))];

    uniqueMultiplesVals.forEach((uniqueMultiples) => {
        uniqueGroupVals.forEach((uniqueGroup) => {

            const groupedLength = uniqueColVals.map((v) => {
                const allObjs = catCurr.values.filter((c) => c.val === v).map((c) => c.id);
                const allGroupObjs = currGroupColumn.values.filter((c) => c.val === uniqueGroup).map((c) => c.id);
                const allMultiplesObjs = currMultiplesColumn.values.filter((c) => c.val === uniqueMultiples).map((c) => c.id);

                const joinedObjs = allObjs.filter((c) => allGroupObjs.includes(c) && allMultiplesObjs.includes(c));

                return normalizedFlag ? joinedObjs.length / allObjs.length * 100 : joinedObjs.length;
            });

            plots.push({
                data: {
                    x: vertFlag ? [...new Set(catCurr.values.map((v) => v.val))] : groupedLength,
                    y: !vertFlag ? [...new Set(catCurr.values.map((v) => v.val))] : groupedLength,
                    orientation: vertFlag ? 'v' : 'h',
                    xaxis: plotCounter === 1 ? 'x' : 'x' + plotCounter,
                    yaxis: plotCounter === 1 ? 'y' : 'y' + plotCounter,
                    showlegend: plotCounter === 1 ? true : false,
                    type: 'bar',
                    name: uniqueGroup,
                    marker: {
                        color: scales.color(uniqueGroup),
                    }
                },
                xLabel: vertFlag ? catCurr.info.name : normalizedFlag ? 'Percent of Total' : 'Count',
                yLabel: vertFlag ? normalizedFlag ? 'Percent of Total' : 'Count' : catCurr.info.name
            });
        });
        plotCounter += 1;
    });

    return plotCounter;
}

function setPlotsWithGroups(columns, config, plots, scales, plotCounter): number {

    const catCols: VisCategoricalColumn[] = columns.filter((c) => config.catColumnsSelected.filter((d) => c.info.id === d.id).length > 0 && c.type === EColumnTypes.CATEGORICAL) as VisCategoricalColumn[];
    const vertFlag = config.direction === EBarDirection.VERTICAL;
    const normalizedFlag = config.display === EBarDisplayType.NORMALIZED;
    const catCurr = catCols[0];
    const currColumn = getCol(columns, config.group) as VisCategoricalColumn;

    const uniqueGroupVals = [...new Set(currColumn.values.map((v) => v.val))];
    const uniqueColVals = [...new Set(catCurr.values.map((v) => v.val))];

    uniqueGroupVals.forEach((uniqueVal) => {

        const groupedLength = uniqueColVals.map((v) => {
            const allObjs = catCurr.values.filter((c) => c.val === v).map((c) => c.id);
            const allGroupObjs = currColumn.values.filter((c) => c.val === uniqueVal).map((c) => c.id);
            const joinedObjs = allObjs.filter((c) => allGroupObjs.includes(c));

            return normalizedFlag ? joinedObjs.length / allObjs.length * 100 : joinedObjs.length;
        });

        plots.push({
            data: {
                x: vertFlag ? [...new Set(catCurr.values.map((v) => v.val))] : groupedLength,
                y: !vertFlag ? [...new Set(catCurr.values.map((v) => v.val))] : groupedLength,
                orientation: vertFlag ? 'v' : 'h',
                xaxis: plotCounter === 1 ? 'x' : 'x' + plotCounter,
                yaxis: plotCounter === 1 ? 'y' : 'y' + plotCounter,
                showlegend: plotCounter === 1 ? true : false,
                type: 'bar',
                name: uniqueVal,
                marker: {
                    color: scales.color(uniqueVal),
                }
            },
            xLabel: vertFlag ? catCurr.info.name : normalizedFlag ? 'Percent of Total' : 'Count',
            yLabel: vertFlag ? normalizedFlag ? 'Percent of Total' : 'Count' : catCurr.info.name
        });
    });

    return plotCounter;
}

function setPlotsWithMultiples(columns, config, plots, scales, plotCounter): number {

    const catCols: VisCategoricalColumn[] = columns.filter((c) => config.catColumnsSelected.filter((d) => c.info.id === d.id).length > 0 && c.type === EColumnTypes.CATEGORICAL) as VisCategoricalColumn[];
    const vertFlag = config.direction === EBarDirection.VERTICAL;
    const normalizedFlag = config.display === EBarDisplayType.NORMALIZED;
    const catCurr = catCols[0];
    const currColumn = getCol(columns, config.multiples) as VisCategoricalColumn;

    const uniqueGroupVals = [...new Set(currColumn.values.map((v) => v.val))];
    const uniqueColVals = [...new Set(catCurr.values.map((v) => v.val))];

    uniqueGroupVals.forEach((uniqueVal) => {

        const groupedLength = uniqueColVals.map((v) => {
            const allObjs = catCurr.values.filter((c) => c.val === v).map((c) => c.id);
            const allGroupObjs = currColumn.values.filter((c) => c.val === uniqueVal).map((c) => c.id);
            const joinedObjs = allObjs.filter((c) => allGroupObjs.includes(c));

            return normalizedFlag ? joinedObjs.length / allObjs.length * 100 : joinedObjs.length;
        });

        plots.push({
            data: {
                x: vertFlag ? [...new Set(catCurr.values.map((v) => v.val))] : groupedLength,
                y: !vertFlag ? [...new Set(catCurr.values.map((v) => v.val))] : groupedLength,
                orientation: vertFlag ? 'v' : 'h',
                xaxis: plotCounter === 1 ? 'x' : 'x' + plotCounter,
                yaxis: plotCounter === 1 ? 'y' : 'y' + plotCounter,
                showlegend: plotCounter === 1 ? true : false,
                type: 'bar',
                name: uniqueVal,
            },
            xLabel: vertFlag ? catCurr.info.name : normalizedFlag ? 'Percent of Total' : 'Count',
            yLabel: vertFlag ? normalizedFlag ? 'Percent of Total' : 'Count' : catCurr.info.name
        });
        plotCounter += 1;
    });

    return plotCounter;
}

function setPlotsBasic(columns, config, plots, scales, plotCounter): number {

    const catCols: VisCategoricalColumn[] = columns.filter((c) => config.catColumnsSelected.filter((d) => c.info.id === d.id).length > 0 && c.type === EColumnTypes.CATEGORICAL) as VisCategoricalColumn[];
    const vertFlag = config.direction === EBarDirection.VERTICAL;
    const normalizedFlag = config.display === EBarDisplayType.NORMALIZED;
    const catCurr = catCols[0];

    const count = [...new Set(catCurr.values.map((v) => v.val))].map((curr) => catCurr.values.filter((c) => c.val === curr).length);
    const valArr = [...new Set(catCurr.values.map((v) => v.val))];
    plots.push({
        data: {
            x: vertFlag ? valArr : count,
            y: !vertFlag ? valArr : count,
            orientation: vertFlag ? 'v' : 'h',
            xaxis: plotCounter === 1 ? 'x' : 'x' + plotCounter,
            yaxis: plotCounter === 1 ? 'y' : 'y' + plotCounter,
            type: 'bar',
            name: catCurr.info.name
        },
        xLabel: vertFlag ? catCurr.info.name : normalizedFlag ? 'Percent of Total' : 'Count',
        yLabel: vertFlag ? normalizedFlag ? 'Percent of Total' : 'Count' : catCurr.info.name
    });
    plotCounter += 1;

    return plotCounter;
}

