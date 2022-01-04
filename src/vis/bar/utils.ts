import {merge} from 'lodash';
import {I18nextManager} from '../..';
import {VisCategoricalColumn, ColumnInfo, EColumnTypes, ESupportedPlotlyVis, IVisConfig, Scales, VisColumn, VisCategoricalValue} from '../interfaces';
import {PlotlyInfo, PlotlyData} from '../interfaces';
import {resolveColumnValues, resolveSingleColumn} from '../layoutUtils';
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


export async function createBarTraces(
    columns: VisColumn[],
    config: IBarConfig,
    scales: Scales,
): Promise<PlotlyInfo> {
    let plotCounter = 1;

    if(!config.catColumnsSelected) {
        return {
            plots: [],
            legendPlots: [],
            rows: 0,
            cols: 0,
            errorMessage: I18nextManager.getInstance().i18n.t('tdp:core.vis.barError'),
        };
    }

    const plots: PlotlyData[] = [];

    const catCols: VisCategoricalColumn[] = columns.filter((c) => config.catColumnsSelected.some((d) => c.info.id === d.id) && c.type === EColumnTypes.CATEGORICAL) as VisCategoricalColumn[];

    if(catCols.length > 0) {
        if(config.group && config.multiples) {
            plotCounter = await setPlotsWithGroupsAndMultiples(columns, catCols, config, plots, scales, plotCounter);
        } else if(config.group) {
            plotCounter = await setPlotsWithGroups(columns, catCols, config, plots, scales, plotCounter);
        } else if(config.multiples) {
            plotCounter = await setPlotsWithMultiples(columns, catCols, config, plots, scales, plotCounter);
        } else {
            plotCounter = await setPlotsBasic(columns, catCols, config, plots, scales, plotCounter);
        }
    }

    const rows = Math.ceil(Math.sqrt(plotCounter - 1));
    const cols = Math.ceil((plotCounter - 1) / rows);

    return {
        plots,
        legendPlots: [],
        rows,
        cols,
        errorMessage: I18nextManager.getInstance().i18n.t('tdp:core.vis.barError'),
    };
}

async function setPlotsWithGroupsAndMultiples(columns: VisColumn[], catCols: VisCategoricalColumn[], config: IBarConfig, plots: PlotlyData[], scales: Scales, plotCounter: number): Promise<number> {

    const catColValues = await resolveColumnValues(catCols);
    const vertFlag = config.direction === EBarDirection.VERTICAL;
    const normalizedFlag = config.display === EBarDisplayType.NORMALIZED;
    const catCurr = catColValues[0];
    const currGroupColumn = await resolveSingleColumn(getCol(columns, config.group));
    const currMultiplesColumn = await resolveSingleColumn(getCol(columns, config.multiples));

    const uniqueGroupVals: string[] = [...new Set(currGroupColumn.resolvedValues.map((v) => v.val))] as string[];
    const uniqueMultiplesVals: string[] = [...new Set(currMultiplesColumn.resolvedValues.map((v) => v.val))] as string[];

    const uniqueColVals = [...new Set(catCurr.resolvedValues.map((v) => v.val))];

    uniqueMultiplesVals.forEach((uniqueMultiples) => {
        uniqueGroupVals.forEach((uniqueGroup) => {

            const groupedLength = uniqueColVals.map((v) => {
                const allObjs = (catCurr.resolvedValues as VisCategoricalValue[]).filter((c) => c.val === v).map((c) => c.id);
                const allGroupObjs = (currGroupColumn.resolvedValues as VisCategoricalValue[]).filter((c) => c.val === uniqueGroup).map((c) => c.id);
                const allMultiplesObjs = (currMultiplesColumn.resolvedValues as VisCategoricalValue[]).filter((c) => c.val === uniqueMultiples).map((c) => c.id);

                const joinedObjs = allObjs.filter((c) => allGroupObjs.includes(c) && allMultiplesObjs.includes(c));

                return normalizedFlag ? joinedObjs.length / allObjs.length * 100 : joinedObjs.length;
            });

            plots.push({
                data: {
                    x: vertFlag ? [...new Set(catCurr.resolvedValues.map((v) => v.val))] : groupedLength,
                    y: !vertFlag ? [...new Set(catCurr.resolvedValues.map((v) => v.val))] : groupedLength,
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

async function setPlotsWithGroups(columns: VisColumn[], catCols: VisCategoricalColumn[], config: IBarConfig, plots: PlotlyData[], scales: Scales, plotCounter: number): Promise<number> {

    const catColValues = await resolveColumnValues(catCols);
    const vertFlag = config.direction === EBarDirection.VERTICAL;
    const normalizedFlag = config.display === EBarDisplayType.NORMALIZED;
    const catCurr = catColValues[0];
    const groupColumn = await resolveSingleColumn(getCol(columns, config.group));

    const uniqueGroupVals: string[] = [...new Set(groupColumn.resolvedValues.map((v) => v.val))] as string[];
    const uniqueColVals: string[] = [...new Set(catCurr.resolvedValues.map((v) => v.val))] as string[];

    uniqueGroupVals.forEach((uniqueVal) => {

        const groupedLength = uniqueColVals.map((v) => {
            const allObjs = (catCurr.resolvedValues as VisCategoricalValue[]).filter((c) => c.val === v).map((c) => c.id);
            const allGroupObjs = (groupColumn.resolvedValues as VisCategoricalValue[]).filter((c) => c.val === uniqueVal).map((c) => c.id);
            const joinedObjs = allObjs.filter((c) => allGroupObjs.includes(c));

            return normalizedFlag ? joinedObjs.length / allObjs.length * 100 : joinedObjs.length;
        });

        plots.push({
            data: {
                x: vertFlag ? [...new Set(catCurr.resolvedValues.map((v) => v.val))] : groupedLength,
                y: !vertFlag ? [...new Set(catCurr.resolvedValues.map((v) => v.val))] : groupedLength,
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

async function setPlotsWithMultiples(columns: VisColumn[], catCols: VisCategoricalColumn[], config: IBarConfig, plots: PlotlyData[], scales: Scales, plotCounter: number): Promise<number> {

    const catColValues = await resolveColumnValues(catCols);
    const vertFlag = config.direction === EBarDirection.VERTICAL;
    const normalizedFlag = config.display === EBarDisplayType.NORMALIZED;
    const catCurr = catColValues[0];
    const multiplesColumn = await resolveSingleColumn(getCol(columns, config.multiples));

    const uniqueGroupVals: string[] = [...new Set((await multiplesColumn).resolvedValues.map((v) => v.val))] as string[];
    const uniqueColVals: string[] = [...new Set(catCurr.resolvedValues.map((v) => v.val))] as string[];

    uniqueGroupVals.forEach((uniqueVal) => {

        const groupedLength = uniqueColVals.map((v) => {
            const allObjs = (catCurr.resolvedValues as VisCategoricalValue[]).filter((c) => c.val === v).map((c) => c.id);
            const allGroupObjs = (multiplesColumn.resolvedValues as VisCategoricalValue[]).filter((c) => c.val === uniqueVal).map((c) => c.id);
            const joinedObjs = allObjs.filter((c) => allGroupObjs.includes(c));

            return normalizedFlag ? joinedObjs.length / allObjs.length * 100 : joinedObjs.length;
        });

        plots.push({
            data: {
                x: vertFlag ? [...new Set(catCurr.resolvedValues.map((v) => v.val))] : groupedLength,
                y: !vertFlag ? [...new Set(catCurr.resolvedValues.map((v) => v.val))] : groupedLength,
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

async function setPlotsBasic(columns: VisColumn[], catCols: VisCategoricalColumn[], config: IBarConfig, plots: PlotlyData[], scales: Scales, plotCounter: number): Promise<number> {

    const catColValues = await resolveColumnValues(catCols);
    const vertFlag = config.direction === EBarDirection.VERTICAL;
    const normalizedFlag = config.display === EBarDisplayType.NORMALIZED;
    const catCurr = catColValues[0];

    const count = [...new Set(catCurr.resolvedValues.map((v) => v.val))].map((curr) => (catCurr.resolvedValues as VisCategoricalValue[]).filter((c) => c.val === curr).length);
    const valArr = [...new Set(catCurr.resolvedValues.map((v) => v.val))];
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

