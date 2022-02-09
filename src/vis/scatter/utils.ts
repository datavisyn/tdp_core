import { merge } from 'lodash';
import d3 from 'd3';
import {
  CategoricalColumn,
  EColumnTypes,
  ENumericalColorScaleType,
  ESupportedPlotlyVis,
  IScatterConfig,
  IVisConfig,
  NumericalColumn,
  PlotlyInfo,
  PlotlyData,
  Scales,
} from '../interfaces';
import { getCol } from '../sidebar/utils';
import { getCssValue } from '../../utils';

export function isScatter(s: IVisConfig): s is IScatterConfig {
  return s.type === ESupportedPlotlyVis.SCATTER;
}

const defaultConfig: IScatterConfig = {
  type: ESupportedPlotlyVis.SCATTER,
  numColumnsSelected: [],
  color: null,
  numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
  shape: null,
  isRectBrush: true,
  alphaSliderVal: 1,
};

export function scatterMergeDefaultConfig(columns: (NumericalColumn | CategoricalColumn)[], config: IScatterConfig): IVisConfig {
  const merged = merge({}, defaultConfig, config);

  const numCols = columns.filter((c) => c.type === EColumnTypes.NUMERICAL);

  if (merged.numColumnsSelected.length === 0 && numCols.length > 1) {
    merged.numColumnsSelected.push(numCols[numCols.length - 1].info);
    merged.numColumnsSelected.push(numCols[numCols.length - 2].info);
  } else if (merged.numColumnsSelected.length === 1 && numCols.length > 1) {
    if (numCols[numCols.length - 1].info.id !== merged.numColumnsSelected[0].id) {
      merged.numColumnsSelected.push(numCols[numCols.length - 1].info);
    } else {
      merged.numColumnsSelected.push(numCols[numCols.length - 2].info);
    }
  }

  return merged;
}

const emptyVal = {
  plots: [],
  legendPlots: [],
  rows: 0,
  cols: 0,
  errorMessage: 'To create a Scatterplot, please select at least 2 numerical columns.',
  formList: ['color', 'shape', 'bubble', 'opacity'],
};

export function createScatterTraces(
  columns: (NumericalColumn | CategoricalColumn)[],
  selected: { [key: number]: boolean },
  config: IScatterConfig,
  scales: Scales,
  shapes: string[] | null,
): PlotlyInfo {
  let plotCounter = 1;

  if (!config.numColumnsSelected) {
    return emptyVal;
  }

  const validCols: NumericalColumn[] = config.numColumnsSelected.map(
    (c) => columns.filter((col) => col.type === EColumnTypes.NUMERICAL && col.info.id === c.id)[0] as NumericalColumn,
  );
  const plots: PlotlyData[] = [];

  const shapeScale = config.shape
    ? d3.scale
        .ordinal<string>()
        .domain([...new Set((getCol(columns, config.shape) as CategoricalColumn).values.map((v) => v.val))])
        .range(shapes)
    : null;

  let min = 0;
  let max = 0;

  if (config.color) {
    min = d3.min((getCol(columns, config.color) as NumericalColumn).values.map((v) => +v.val).filter((v) => v !== null));
    max = d3.max((getCol(columns, config.color) as NumericalColumn).values.map((v) => +v.val).filter((v) => v !== null));
  }

    const numericalColorScale = config.color ?
                d3.scale.linear<string, number>()
                    .domain([max,
                        (max + min) / 2,
                        min])
                    .range(config.numColorScaleType === ENumericalColorScaleType.SEQUENTIAL ? [getCssValue('visyn-s9-blue'), getCssValue('visyn-s5-blue'), getCssValue('visyn-s1-blue')] : [getCssValue('visyn-c1'),'#d3d3d3', getCssValue('visyn-c2')])
                : null;

  const legendPlots: PlotlyData[] = [];

  // cant currently do 1d scatterplots
  if (validCols.length === 1) {
    return emptyVal;
  }

  // if exactly 2 then return just one plot. otherwise, loop over and create n*n plots. TODO:: make the diagonal plots that have identical axis a histogram
  if (validCols.length === 2) {
    plots.push({
      data: {
        x: validCols[0].values.map((v) => v.val),
        y: validCols[1].values.map((v) => v.val),
        ids: validCols[0].values.map((v) => v.id.toString()),
        xaxis: plotCounter === 1 ? 'x' : `x${plotCounter}`,
        yaxis: plotCounter === 1 ? 'y' : `y${plotCounter}`,
        type: 'scattergl',
        mode: 'markers',
        showlegend: false,
        text: validCols[0].values.map((v) => v.id.toString()),
        marker: {
          line: {
            width: 0,
          },
          symbol: getCol(columns, config.shape) ? (getCol(columns, config.shape) as CategoricalColumn).values.map((v) => shapeScale(v.val)) : 'circle',
          color: getCol(columns, config.color)
            ? (getCol(columns, config.color) as any).values.map((v) =>
                selected[v.id] ? '#E29609' : getCol(columns, config.color).type === EColumnTypes.NUMERICAL ? numericalColorScale(v.val) : scales.color(v.val),
              )
            : validCols[0].values.map((v) => (selected[v.id] ? '#E29609' : '#2e2e2e')),
          opacity: config.alphaSliderVal,
          size: 10,
        },
      },
      xLabel: validCols[0].info.name,
      yLabel: validCols[1].info.name,
    });
  } else {
    for (const yCurr of validCols) {
      for (const xCurr of validCols) {
        plots.push({
          data: {
            x: xCurr.values.map((v) => v.val),
            y: yCurr.values.map((v) => v.val),
            ids: xCurr.values.map((v) => v.id.toString()),
            xaxis: plotCounter === 1 ? 'x' : `x${plotCounter}`,
            yaxis: plotCounter === 1 ? 'y' : `y${plotCounter}`,
            type: 'scattergl',
            mode: 'markers',
            hoverlabel: {
              namelength: 5,
            },
            showlegend: false,
            text: validCols[0].values.map((v) => v.id.toString()),
            marker: {
              line: {
                width: 0,
              },
              symbol: getCol(columns, config.shape) ? (getCol(columns, config.shape) as CategoricalColumn).values.map((v) => shapeScale(v.val)) : 'circle',
              color: getCol(columns, config.color)
                ? (getCol(columns, config.color) as any).values.map((v) =>
                    selected[v.id]
                      ? '#E29609'
                      : getCol(columns, config.color).type === EColumnTypes.NUMERICAL
                      ? numericalColorScale(v.val)
                      : scales.color(v.val),
                  )
                : xCurr.values.map((v) => (selected[v.id] ? '#E29609' : '#2e2e2e')),
              opacity: config.alphaSliderVal,
              size: 10,
            },
          },
          xLabel: xCurr.info.name,
          yLabel: yCurr.info.name,
        });

        plotCounter += 1;
      }
    }
  }

  // if we have a column for the color, and its a categorical column, add a legendPlot that creates a legend.
  if (getCol(columns, config.color) && getCol(columns, config.color).type === EColumnTypes.CATEGORICAL && validCols.length > 0) {
    legendPlots.push({
      data: {
        x: validCols[0].values.map((v) => v.val),
        y: validCols[0].values.map((v) => v.val),
        ids: validCols[0].values.map((v) => v.id),
        xaxis: 'x',
        yaxis: 'y',
        type: 'scattergl',
        mode: 'markers',
        visible: 'legendonly',
        legendgroup: 'color',
        legendgrouptitle: {
          text: 'Color',
        },
        marker: {
          line: {
            width: 0,
          },
          symbol: 'circle',
          size: 10,
          color: getCol(columns, config.color) ? (getCol(columns, config.color) as any).values.map((v) => scales.color(v.val)) : '#2e2e2e',
          opacity: 0.5,
        },
        transforms: [
          {
            type: 'groupby',
            groups: (getCol(columns, config.color) as any).values.map((v) => v.val),
            styles: [
              ...[...new Set<string>((getCol(columns, config.color) as any).values.map((v) => v.val) as string[])].map((c) => {
                return { target: c, value: { name: c } };
              }),
            ],
          },
        ],
      },
      xLabel: validCols[0].info.name,
      yLabel: validCols[0].info.name,
    } as any);
  }

  // if we have a column for the shape, add a legendPlot that creates a legend.
  if (getCol(columns, config.shape)) {
    legendPlots.push({
      data: {
        x: validCols[0].values.map((v) => v.val),
        y: validCols[0].values.map((v) => v.val),
        ids: validCols[0].values.map((v) => v.id.toString()),
        xaxis: 'x',
        yaxis: 'y',
        type: 'scattergl',
        mode: 'markers',
        visible: 'legendonly',
        showlegend: true,
        legendgroup: 'shape',
        legendgrouptitle: {
          text: 'Shape',
        },
        marker: {
          line: {
            width: 0,
          },
          opacity: config.alphaSliderVal,
          size: 10,
          symbol: getCol(columns, config.shape) ? (getCol(columns, config.shape) as CategoricalColumn).values.map((v) => shapeScale(v.val)) : 'circle',
          color: '#2e2e2e',
        },
        transforms: [
          {
            type: 'groupby',
            groups: (getCol(columns, config.shape) as CategoricalColumn).values.map((v) => v.val),
            styles: [
              ...[...new Set<string>((getCol(columns, config.shape) as CategoricalColumn).values.map((v) => v.val) as string[])].map((c) => {
                return { target: c, value: { name: c } };
              }),
            ],
          },
        ],
      },
      xLabel: validCols[0].info.name,
      yLabel: validCols[0].info.name,
    } as any);
  }

  return {
    plots,
    legendPlots,
    rows: Math.sqrt(plots.length),
    cols: Math.sqrt(plots.length),
    errorMessage: 'To create a Scatterplot, please select at least 2 numerical columns.',
  };
}
