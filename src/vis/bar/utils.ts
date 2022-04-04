import { merge, sum, mean, min, max } from 'lodash';
import { median } from 'd3v7';
import { I18nextManager } from '../../i18n';
import {
  PlotlyInfo,
  PlotlyData,
  VisCategoricalColumn,
  EColumnTypes,
  ESupportedPlotlyVis,
  IVisConfig,
  Scales,
  VisColumn,
  VisCategoricalValue,
  IBarConfig,
  EBarGroupingType,
  EBarDisplayType,
  EBarDirection,
  EAggregateTypes,
  VisNumericalColumn,
  VisNumericalValue,
} from '../interfaces';
import { resolveSingleColumn } from '../general/layoutUtils';
import { getCol } from '../sidebar';

export function isBar(s: IVisConfig): s is IBarConfig {
  return s.type === ESupportedPlotlyVis.BAR;
}

const defaultConfig: IBarConfig = {
  type: ESupportedPlotlyVis.BAR,
  numColumnsSelected: [],
  catColumnSelected: null,
  group: null,
  groupType: EBarGroupingType.STACK,
  multiples: null,
  display: EBarDisplayType.ABSOLUTE,
  direction: EBarDirection.VERTICAL,
  aggregateColumn: null,
  aggregateType: EAggregateTypes.COUNT,
};

export function barMergeDefaultConfig(columns: VisColumn[], config: IBarConfig): IVisConfig {
  const merged = merge({}, defaultConfig, config);

  const catCols = columns.filter((c) => c.type === EColumnTypes.CATEGORICAL);
  const numCols = columns.filter((c) => c.type === EColumnTypes.NUMERICAL);

  if (!merged.catColumnSelected && catCols.length > 0) {
    merged.catColumnSelected = catCols[catCols.length - 1].info;
  }

  if (!merged.aggregateColumn && numCols.length > 0) {
    merged.aggregateColumn = numCols[numCols.length - 1].info;
  }

  return merged;
}

function getAggregateValues(aggType: EAggregateTypes, catColValues: VisCategoricalValue[], aggColValues: VisNumericalValue[]) {
  const categoricalOptions = [...new Set(catColValues.map((v) => v.val))];

  const categoricalMap = {};

  catColValues.forEach((val) => {
    categoricalMap[val.id] = val.val;
  });

  if (aggType === EAggregateTypes.COUNT) {
    return categoricalOptions.map((curr) => (catColValues as VisCategoricalValue[]).filter((c) => c.val === curr).length);
  }
  if (aggType === EAggregateTypes.AVG) {
    return categoricalOptions.map((curr) =>
      mean((aggColValues as VisNumericalValue[]).filter((c) => categoricalMap[c.id] === curr && !Number.isNaN(c.val)).map((c) => c.val)),
    );
  }
  if (aggType === EAggregateTypes.MIN) {
    return categoricalOptions.map((curr) =>
      min((aggColValues as VisNumericalValue[]).filter((c) => categoricalMap[c.id] === curr && !Number.isNaN(c.val)).map((c) => c.val)),
    );
  }
  if (aggType === EAggregateTypes.MED) {
    return categoricalOptions.map((curr) =>
      median((aggColValues as VisNumericalValue[]).filter((c) => categoricalMap[c.id] === curr && !Number.isNaN(c.val)).map((c) => c.val)),
    );
  }

  return categoricalOptions.map((curr) =>
    max((aggColValues as VisNumericalValue[]).filter((c) => categoricalMap[c.id] === curr && !Number.isNaN(c.val)).map((c) => c.val)),
  );
}

function getTotalAggregateValues(
  aggType: EAggregateTypes,
  categoricalOptions: string[],
  catColValues: VisCategoricalValue[],
  aggColValues: VisNumericalValue[],
) {
  const categoricalMap = {};

  catColValues.forEach((val) => {
    categoricalMap[val.id] = val.val;
  });

  if (aggType === EAggregateTypes.COUNT) {
    return sum(categoricalOptions.map((curr) => (catColValues as VisCategoricalValue[]).filter((c) => c.val === curr).length));
  }
  if (aggType === EAggregateTypes.AVG) {
    return sum(
      categoricalOptions.map(
        (curr) => mean((aggColValues as VisNumericalValue[]).filter((c) => categoricalMap[c.id] === curr && !Number.isNaN(c.val)).map((c) => c.val)) || 0,
      ),
    );
  }
  if (aggType === EAggregateTypes.MIN) {
    return sum(
      categoricalOptions.map(
        (curr) => min((aggColValues as VisNumericalValue[]).filter((c) => categoricalMap[c.id] === curr && !Number.isNaN(c.val)).map((c) => c.val)) || 0,
      ),
    );
  }
  if (aggType === EAggregateTypes.MED) {
    return sum(
      categoricalOptions.map(
        (curr) => median((aggColValues as VisNumericalValue[]).filter((c) => categoricalMap[c.id] === curr && !Number.isNaN(c.val)).map((c) => c.val)) || 0,
      ),
    );
  }

  return sum(
    categoricalOptions.map(
      (curr) => max((aggColValues as VisNumericalValue[]).filter((c) => categoricalMap[c.id] === curr && !Number.isNaN(c.val)).map((c) => c.val)) || 0,
    ),
  );
}

async function setPlotsWithGroupsAndMultiples(
  columns: VisColumn[],
  catCol: VisCategoricalColumn,
  config: IBarConfig,
  plots: PlotlyData[],
  scales: Scales,
  plotCounter: number,
): Promise<number> {
  let plotCounterEdit = plotCounter;
  const catColValues = await resolveSingleColumn(catCol);
  const vertFlag = config.direction === EBarDirection.VERTICAL;
  const normalizedFlag = config.display === EBarDisplayType.NORMALIZED;
  const currGroupColumn = await resolveSingleColumn(getCol(columns, config.group));
  const currMultiplesColumn = await resolveSingleColumn(getCol(columns, config.multiples));

  const uniqueGroupVals: string[] = [...new Set(currGroupColumn.resolvedValues.map((v) => v.val))] as string[];
  const uniqueMultiplesVals: string[] = [...new Set(currMultiplesColumn.resolvedValues.map((v) => v.val))] as string[];

  const uniqueColVals = [...new Set(catColValues.resolvedValues.map((v) => v.val))];

  uniqueMultiplesVals.forEach((uniqueMultiples) => {
    uniqueGroupVals.forEach((uniqueGroup) => {
      const groupedLength = uniqueColVals.map((v) => {
        const allObjs = (catColValues.resolvedValues as VisCategoricalValue[]).filter((c) => c.val === v).map((c) => c.id);
        const allGroupObjs = (currGroupColumn.resolvedValues as VisCategoricalValue[]).filter((c) => c.val === uniqueGroup).map((c) => c.id);
        const allMultiplesObjs = (currMultiplesColumn.resolvedValues as VisCategoricalValue[]).filter((c) => c.val === uniqueMultiples).map((c) => c.id);

        const joinedObjs = allObjs.filter((c) => allGroupObjs.includes(c) && allMultiplesObjs.includes(c));

        return normalizedFlag ? (joinedObjs.length / allObjs.length) * 100 : joinedObjs.length;
      });

      plots.push({
        data: {
          x: vertFlag ? [...new Set(catColValues.resolvedValues.map((v) => v.val))] : groupedLength,
          y: !vertFlag ? [...new Set(catColValues.resolvedValues.map((v) => v.val))] : groupedLength,
          orientation: vertFlag ? 'v' : 'h',
          xaxis: plotCounterEdit === 1 ? 'x' : `x${plotCounterEdit}`,
          yaxis: plotCounterEdit === 1 ? 'y' : `y${plotCounterEdit}`,
          showlegend: plotCounterEdit === 1,
          type: 'bar',
          name: uniqueGroup,
          marker: {
            color: scales.color(uniqueGroup),
          },
        },
        xLabel: vertFlag ? catColValues.info.name : normalizedFlag ? 'Percent of Total' : 'Count',
        yLabel: vertFlag ? (normalizedFlag ? 'Percent of Total' : 'Count') : catColValues.info.name,
      });
    });
    plotCounterEdit += 1;
  });

  return plotCounterEdit;
}

async function setPlotsWithGroups(
  columns: VisColumn[],
  catCol: VisCategoricalColumn,
  aggType: EAggregateTypes,
  aggColumn: VisNumericalColumn,
  config: IBarConfig,
  plots: PlotlyData[],
  scales: Scales,
  plotCounter: number,
): Promise<number> {
  const catColValues = await resolveSingleColumn(catCol);
  const aggColValues = await resolveSingleColumn(aggColumn);

  const vertFlag = config.direction === EBarDirection.VERTICAL;
  const normalizedFlag = config.display === EBarDisplayType.NORMALIZED;
  const groupColumn = await resolveSingleColumn(getCol(columns, config.group));

  const uniqueGroupVals: string[] = [...new Set(groupColumn.resolvedValues.map((v) => v.val))] as string[];
  const uniqueColVals: string[] = [...new Set(catColValues.resolvedValues.map((v) => v.val))] as string[];

  uniqueGroupVals.forEach((uniqueVal) => {
    const finalAggregateValues = uniqueColVals
      .map((v) => {
        const allObjs = (catColValues.resolvedValues as VisCategoricalValue[]).filter((c) => c.val === v);
        const allGroupObjs = (groupColumn.resolvedValues as VisCategoricalValue[]).filter((c) => c.val === uniqueVal);
        const joinedObjs = allObjs.filter((allVal) => allGroupObjs.find((groupVal) => groupVal.id === allVal.id));

        const aggregateValues = getAggregateValues(aggType, joinedObjs, aggColValues.resolvedValues as VisNumericalValue[]);
        const ungroupedAggregateValues = getTotalAggregateValues(
          aggType,
          uniqueGroupVals,
          groupColumn.resolvedValues.filter((val) => allObjs.find((insideVal) => insideVal.id === val.id)) as VisCategoricalValue[],
          aggColValues.resolvedValues as VisNumericalValue[],
        );

        console.log(ungroupedAggregateValues);

        return joinedObjs.length === 0 ? [0] : normalizedFlag ? (aggregateValues[0] / ungroupedAggregateValues) * 100 : aggregateValues;
      })
      .flat();

    plots.push({
      data: {
        x: vertFlag ? [...new Set(catColValues.resolvedValues.map((v) => v.val))] : finalAggregateValues,
        y: !vertFlag ? [...new Set(catColValues.resolvedValues.map((v) => v.val))] : finalAggregateValues,
        orientation: vertFlag ? 'v' : 'h',
        xaxis: plotCounter === 1 ? 'x' : `x${plotCounter}`,
        yaxis: plotCounter === 1 ? 'y' : `y${plotCounter}`,
        showlegend: plotCounter === 1,
        type: 'bar',
        name: uniqueVal,
        marker: {
          color: scales.color(uniqueVal),
        },
      },
      xLabel: vertFlag ? catColValues.info.name : normalizedFlag ? 'Percent of Total' : aggType,
      yLabel: vertFlag ? (normalizedFlag ? 'Percent of Total' : aggType) : catColValues.info.name,
    });
  });

  return plotCounter;
}

async function setPlotsWithMultiples(
  columns: VisColumn[],
  catCol: VisCategoricalColumn,
  aggType: EAggregateTypes,
  aggColumn: VisNumericalColumn,
  config: IBarConfig,
  plots: PlotlyData[],
  plotCounter: number,
): Promise<number> {
  let plotCounterEdit = plotCounter;
  const catColValues = await resolveSingleColumn(catCol);
  const aggColValues = await resolveSingleColumn(aggColumn);

  const vertFlag = config.direction === EBarDirection.VERTICAL;
  const normalizedFlag = config.display === EBarDisplayType.NORMALIZED;
  const multiplesColumn = await resolveSingleColumn(getCol(columns, config.multiples));

  const uniqueMultiplesVals: string[] = [...new Set((await multiplesColumn).resolvedValues.map((v) => v.val))] as string[];
  const uniqueColVals: string[] = [...new Set(catColValues.resolvedValues.map((v) => v.val))] as string[];

  uniqueMultiplesVals.forEach((uniqueVal) => {
    const finalAggregateValues = uniqueColVals
      .map((v) => {
        const allObjs = (catColValues.resolvedValues as VisCategoricalValue[]).filter((c) => c.val === v);
        const allMultiplesObjs = (multiplesColumn.resolvedValues as VisCategoricalValue[]).filter((c) => c.val === uniqueVal);
        const joinedObjs = allObjs.filter((c) => allMultiplesObjs.find((multiplesObj) => multiplesObj.id === c.id));

        const aggregateValues = getAggregateValues(aggType, joinedObjs, aggColValues.resolvedValues as VisNumericalValue[]);
        const ungroupedAggregateValues = getTotalAggregateValues(
          aggType,
          uniqueMultiplesVals,
          multiplesColumn.resolvedValues.filter((val) => allObjs.find((insideVal) => insideVal.id === val.id)) as VisCategoricalValue[],
          aggColValues.resolvedValues as VisNumericalValue[],
        );
        return joinedObjs.length === 0 ? [0] : normalizedFlag ? (aggregateValues[0] / ungroupedAggregateValues[0]) * 100 : aggregateValues;
      })
      .flat();

    plots.push({
      data: {
        x: vertFlag ? [...new Set(catColValues.resolvedValues.map((v) => v.val))] : finalAggregateValues,
        y: !vertFlag ? [...new Set(catColValues.resolvedValues.map((v) => v.val))] : finalAggregateValues,
        orientation: vertFlag ? 'v' : 'h',
        xaxis: plotCounterEdit === 1 ? 'x' : `x${plotCounterEdit}`,
        yaxis: plotCounterEdit === 1 ? 'y' : `y${plotCounterEdit}`,
        showlegend: plotCounterEdit === 1,
        type: 'bar',
        name: uniqueVal,
      },
      xLabel: vertFlag ? catColValues.info.name : normalizedFlag ? 'Percent of Total' : aggType,
      yLabel: vertFlag ? (normalizedFlag ? 'Percent of Total' : aggType) : catColValues.info.name,
    });
    plotCounterEdit += 1;
  });

  return plotCounterEdit;
}

async function setPlotsBasic(
  columns: VisColumn[],
  aggType: EAggregateTypes,
  aggregateColumn: VisNumericalColumn | null,
  catCol: VisCategoricalColumn,
  config: IBarConfig,
  plots: PlotlyData[],
  scales: Scales,
  plotCounter: number,
): Promise<number> {
  let plotCounterEdit = plotCounter;
  const catColValues = await resolveSingleColumn(catCol);
  const aggColValues = await resolveSingleColumn(aggregateColumn);

  const vertFlag = config.direction === EBarDirection.VERTICAL;

  const aggValues = getAggregateValues(aggType, catColValues.resolvedValues as VisCategoricalValue[], aggColValues.resolvedValues as VisNumericalValue[]);

  const valArr = [...new Set(catColValues.resolvedValues.map((v) => v.val as string))];
  plots.push({
    data: {
      x: vertFlag ? valArr : aggValues,
      y: !vertFlag ? valArr : aggValues,
      ids: valArr,
      orientation: vertFlag ? 'v' : 'h',
      xaxis: plotCounter === 1 ? 'x' : `x${plotCounter}`,
      yaxis: plotCounter === 1 ? 'y' : `y${plotCounter}`,
      type: 'bar',
      name: catColValues.info.name,
    },
    xLabel: vertFlag ? catColValues.info.name : aggType,
    yLabel: vertFlag ? aggType : catColValues.info.name,
  });
  plotCounterEdit += 1;

  return plotCounterEdit;
}

export async function createBarTraces(columns: VisColumn[], config: IBarConfig, scales: Scales): Promise<PlotlyInfo> {
  let plotCounter = 1;

  if (!config.catColumnSelected) {
    return {
      plots: [],
      legendPlots: [],
      rows: 0,
      cols: 0,
      errorMessage: I18nextManager.getInstance().i18n.t('tdp:core.vis.barError'),
      errorMessageHeader: I18nextManager.getInstance().i18n.t('tdp:core.vis.errorHeader'),
    };
  }

  const plots: PlotlyData[] = [];

  const catCol: VisCategoricalColumn = columns.find((c) => c.info.id === config.catColumnSelected.id) as VisCategoricalColumn;
  const aggregateColumn: VisNumericalColumn = config.aggregateColumn
    ? (columns.find((c) => c.info.id === config.aggregateColumn.id) as VisNumericalColumn)
    : null;

  if (catCol) {
    if (config.group && config.multiples) {
      plotCounter = await setPlotsWithGroupsAndMultiples(columns, catCol, config, plots, scales, plotCounter);
    } else if (config.group) {
      plotCounter = await setPlotsWithGroups(columns, catCol, config.aggregateType, aggregateColumn, config, plots, scales, plotCounter);
    } else if (config.multiples) {
      plotCounter = await setPlotsWithMultiples(columns, catCol, config.aggregateType, aggregateColumn, config, plots, plotCounter);
    } else {
      plotCounter = await setPlotsBasic(columns, config.aggregateType, aggregateColumn, catCol, config, plots, scales, plotCounter);
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
    errorMessageHeader: I18nextManager.getInstance().i18n.t('tdp:core.vis.errorHeader'),
  };
}
