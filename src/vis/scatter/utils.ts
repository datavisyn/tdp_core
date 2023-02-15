import { merge } from 'lodash';
import d3v3 from 'd3v3';
import { EChartsOption } from 'echarts';
import { transform } from 'echarts-stat';
import * as ecStat from 'echarts-stat';
import {
  PlotlyInfo,
  PlotlyData,
  EColumnTypes,
  VisNumericalColumn,
  IVisConfig,
  Scales,
  ESupportedPlotlyVis,
  VisColumn,
  IScatterConfig,
  ENumericalColorScaleType,
  VisCategoricalValue,
  VisNumericalValue,
  EScatterSelectSettings,
  ColumnInfo,
  EChartsInfo,
} from '../interfaces';
import { getCol } from '../sidebar';
import { getCssValue } from '../../utils';
import { columnNameWithDescription, resolveColumnValues, resolveSingleColumn } from '../general/layoutUtils';
import { I18nextManager } from '../../i18n';
import { DEFAULT_COLOR, SELECT_COLOR } from '../general/constants';

export function isScatter(s: IVisConfig): s is IScatterConfig {
  return s.type === ESupportedPlotlyVis.SCATTER;
}

function calculateDomain(domain: [number | undefined, number | undefined], vals: number[]): [number, number] {
  if (!domain) return null;
  if (domain[0] !== undefined && domain[1] !== undefined) {
    return [domain[0], domain[1]];
  }
  const min = Math.min(...(vals as number[]));
  const max = Math.max(...(vals as number[]));

  const calcDomain: [number, number] = [domain[0] ? domain[0] : min, domain[1] ? domain[1] : max + max / 20];

  return calcDomain;
}

const defaultConfig: IScatterConfig = {
  type: ESupportedPlotlyVis.SCATTER,
  numColumnsSelected: [],
  color: null,
  numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
  shape: null,
  dragMode: EScatterSelectSettings.RECTANGLE,
  alphaSliderVal: 0.5,
};

export function scatterMergeDefaultConfig(columns: VisColumn[], config: IScatterConfig): IVisConfig {
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

export function moveSelectedToFront(
  col: (VisCategoricalValue | VisNumericalValue)[],
  selectedMap: { [key: string]: boolean },
): (VisCategoricalValue | VisNumericalValue)[] {
  const selectedVals = col.filter((v) => selectedMap[v.id]);
  const remainingVals = col.filter((v) => !selectedMap[v.id]);

  const sortedCol = [...remainingVals, ...selectedVals];

  return sortedCol;
}

export async function createScatterTraces(
  columns: VisColumn[],
  numColumnsSelected: ColumnInfo[],
  shape: ColumnInfo,
  color: ColumnInfo,
  alphaSliderVal: number,
  colorScaleType: ENumericalColorScaleType,
  scales: Scales,
  shapes: string[] | null,
): Promise<EChartsInfo> {
  const emptyVal = {
    plots: [],
    legendPlots: [],
    rows: 0,
    cols: 0,
    errorMessage: I18nextManager.getInstance().i18n.t('tdp:core.vis.scatterError'),
    errorMessageHeader: I18nextManager.getInstance().i18n.t('tdp:core.vis.errorHeader'),

    formList: ['color', 'shape', 'bubble', 'opacity'],
  };

  if (!numColumnsSelected) {
    return emptyVal;
  }

  const numCols: VisNumericalColumn[] = numColumnsSelected.map((c) => columns.find((col) => col.info.id === c.id) as VisNumericalColumn);
  const plots: EChartsOption[] = [];

  const validCols = await resolveColumnValues(numCols);
  const shapeCol = await resolveSingleColumn(getCol(columns, shape));
  const colorCol = await resolveSingleColumn(getCol(columns, color));

  const shapeScale = shape
    ? d3v3.scale
        .ordinal<string>()
        .domain([...new Set(shapeCol.resolvedValues.map((v) => v.val))] as string[])
        .range(shapes)
    : null;

  let min = 0;
  let max = 0;

  if (color) {
    min = d3v3.min(colorCol.resolvedValues.map((v) => +v.val).filter((v) => v !== null));
    max = d3v3.max(colorCol.resolvedValues.map((v) => +v.val).filter((v) => v !== null));
  }

  const numericalColorScale = color
    ? d3v3.scale
        .linear<string, number>()
        .domain([max, (max + min) / 2, min])
        .range(
          colorScaleType === ENumericalColorScaleType.SEQUENTIAL
            ? [getCssValue('visyn-s9-blue'), getCssValue('visyn-s5-blue'), getCssValue('visyn-s1-blue')]
            : [getCssValue('visyn-c1'), '#d3d3d3', getCssValue('visyn-c2')],
        )
    : null;

  const legendPlots: PlotlyData[] = [];

  // cant currently do 1d scatterplots
  if (validCols.length === 1) {
    return emptyVal;
  }

  const uniqueColorVals = new Set(colorCol?.resolvedValues.map((v) => v.val));

  // if exactly 2 then return just one plot. otherwise, loop over and create n*n plots. TODO:: make the diagonal plots that have identical axis a histogram
  if (validCols.length === 2) {
    const xDataVals = validCols[0].resolvedValues.map((v) => v.val);
    const yDataVals = validCols[1].resolvedValues.map((v) => v.val);

    // const calcXDomain = calculateDomain((validCols[0] as VisNumericalColumn).domain, xDataVals as number[]);
    // const calcYDomain = calculateDomain((validCols[1] as VisNumericalColumn).domain, yDataVals as number[]);

    plots.push({
      title: {
        text: ``,
      },
      tooltip: {},
      legend: {
        orient: 'vertical',
        right: 10,
      },
      xAxis: [{ type: 'value' }],
      yAxis: [{ type: 'value' }],
      visualMap:
        colorCol && colorCol.type === EColumnTypes.NUMERICAL
          ? {
              min: 0,
              max: 100,
              dimension: 1,
              type: 'continuous',
              orient: 'vertical',
              right: 10,
              top: 'center',
              text: ['HIGH', 'LOW'],
              calculable: false,
              inRange: {
                color:
                  colorScaleType === ENumericalColorScaleType.SEQUENTIAL
                    ? [getCssValue('visyn-s9-blue'), getCssValue('visyn-s5-blue'), getCssValue('visyn-s1-blue')]
                    : [getCssValue('visyn-c1'), '#d3d3d3', getCssValue('visyn-c2')],
              },
            }
          : null,
      dataZoom: [
        {
          type: 'inside',
        },
        {
          type: 'slider',
        },
        {
          type: 'inside',
          orient: 'vertical',
        },
        {
          type: 'slider',
          orient: 'vertical',
          left: 50,
        },
      ],
      brush: {
        toolbox: [null],
        brushType: 'rect',
        brushMode: 'single',
        // brushLink: 'all',
      },
      animation: false,
      series:
        colorCol?.type === EColumnTypes.CATEGORICAL
          ? [...uniqueColorVals].map((uniqueColor) => {
              return {
                name: uniqueColor,
                type: 'scatter',
                data: colorCol.resolvedValues
                  .map((d, i) => {
                    return [d.val === uniqueColor, validCols[0].resolvedValues[i].val, validCols[1].resolvedValues[i].val];
                  })
                  .filter((id) => id[0])
                  .map((iid) => [iid[1], iid[2]] as [number, number]),
                dimensions: ['x', 'y'],
                symbolSize: 7,

                itemStyle: {
                  opacity: alphaSliderVal,
                },
                large: true,
              };
            })
          : [
              {
                type: 'scatter',
                data: validCols[0].resolvedValues.map((d, i) => [d.val, validCols[1].resolvedValues[i].val]),
                dimensions: ['x', 'y'],
                color: DEFAULT_COLOR,
                symbolSize: 7,
                itemStyle: {
                  opacity: alphaSliderVal,
                },
                large: true,
              },
            ],
    });
  } else {
    const validColsGrid = validCols.map((xCol) => validCols.map((yCol) => ({ xCol, yCol }))).flat();

    console.log(validColsGrid);
    plots.push({
      title: {
        text: ``,
      },
      tooltip: {},
      legend: {
        orient: 'vertical',
        right: 10,
      },
      dataZoom: validCols
        .map((col, i) => [
          { xAxisIndex: [i, i + 3, i + 6], type: 'inside' },
          { yAxisIndex: [i * 3, i * 3 + 1, i * 3 + 2], type: 'inside' },
          {
            xAxisIndex: [i, i + 3, i + 6],
            type: 'slider',
            bottom: 10,
            height: 20,
            width: `${100 / validCols.length - 5}%`,
            left: `${((i % validColsGrid.length) * 100) / Math.sqrt(validColsGrid.length)}%`,
          },
          {
            yAxisIndex: [i * 3, i * 3 + 1, i * 3 + 2],
            type: 'slider',
            left: 10,
            width: 20,
            height: `${100 / validCols.length - 5}%`,
            top: `${((i % validColsGrid.length) * 100) / Math.sqrt(validColsGrid.length)}%`,
            orientation: 'vertical',
          },
        ])
        .flat(),
      visualMap:
        colorCol && colorCol.type === EColumnTypes.NUMERICAL
          ? {
              min: 0,
              max: 100,
              dimension: 1,
              type: 'continuous',
              orient: 'vertical',
              right: 10,
              top: 'center',
              text: ['HIGH', 'LOW'],
              calculable: false,
              inRange: {
                color:
                  colorScaleType === ENumericalColorScaleType.SEQUENTIAL
                    ? [getCssValue('visyn-s9-blue'), getCssValue('visyn-s5-blue'), getCssValue('visyn-s1-blue')]
                    : [getCssValue('visyn-c1'), '#d3d3d3', getCssValue('visyn-c2')],
              },
            }
          : null,
      // dataZoom: [
      //   {
      //     type: 'inside',
      //   },
      //   {
      //     type: 'slider',
      //   },
      //   {
      //     type: 'inside',
      //     orient: 'vertical',
      //   },
      //   {
      //     type: 'slider',
      //     orient: 'vertical',
      //     left: 50,
      //   },
      // ],
      brush: {
        toolbox: [null],
        brushType: 'rect',
        brushMode: 'single',
        brushLink: 'all',
        xAxisIndex: validColsGrid.map((c, i) => i),
        yAxisIndex: validColsGrid.map((c, i) => i),
      },
      grid: validColsGrid.map((grid, i) => {
        return {
          id: `${grid.xCol.info.id},${grid.yCol.info.id}`,
          left: `${((i % Math.sqrt(validColsGrid.length)) * 100) / Math.sqrt(validColsGrid.length)}%`,
          top: `${(Math.floor(i / Math.sqrt(validColsGrid.length)) * 100) / Math.sqrt(validColsGrid.length)}%`,
          width: `${100 / Math.sqrt(validColsGrid.length) - 5}%`,
          height: `${100 / Math.sqrt(validColsGrid.length) - 5}%`,
        };
      }),
      // grid: [
      //   {
      //     id: 'xAxisLeft-yAxisTop',
      //     left: 80,
      //     top: 50,
      //     width: '35%',
      //     height: '35%',
      //   },
      //   {
      //     id: 'xAxisLeft-yAxisBottom',
      //     left: 80,
      //     bottom: 50,
      //     width: '35%',
      //     height: '35%',
      //   },
      //   {
      //     id: 'xAxisRight-yAxisTop',
      //     right: 80,
      //     top: 50,
      //     width: '35%',
      //     height: '35%',
      //   },
      //   {
      //     id: 'xAxisRight-yAxisBottom',
      //     right: 80,
      //     bottom: 50,
      //     width: '35%',
      //     height: '35%',
      //   },
      // ],
      xAxis: validColsGrid.map((grid, i) => {
        return { id: `${grid.xCol.info.id},${grid.yCol.info.id}`, gridId: `${grid.xCol.info.id},${grid.yCol.info.id}` };
      }),
      yAxis: validColsGrid.map((grid, i) => {
        return { id: `${grid.xCol.info.id},${grid.yCol.info.id}`, gridId: `${grid.xCol.info.id},${grid.yCol.info.id}` };
      }),

      animation: false,
      series:
        colorCol?.type === EColumnTypes.CATEGORICAL
          ? [...uniqueColorVals].map((uniqueColor) => {
              return {
                name: uniqueColor,
                type: 'scatter',
                data: colorCol.resolvedValues
                  .map((d, i) => {
                    return [d.val === uniqueColor, validCols[0].resolvedValues[i].val, validCols[1].resolvedValues[i].val];
                  })
                  .filter((id) => id[0])
                  .map((iid) => [iid[1], iid[2]] as [number, number]),
                dimensions: ['x', 'y'],
                symbolSize: 7,

                itemStyle: {
                  opacity: alphaSliderVal,
                },
                large: true,
              };
            })
          : validColsGrid.map((grid) => {
              if (grid.xCol.info.id === grid.yCol.info.id) {
                return {
                  type: 'bar',
                  data: ecStat.histogram(
                    grid.xCol.resolvedValues.map((val) => val.val as number),
                    'squareRoot',
                  ).data,
                  xAxisId: `${grid.xCol.info.id},${grid.yCol.info.id}`,
                  yAxisId: `${grid.xCol.info.id},${grid.yCol.info.id}`,
                  itemStyle: {
                    color: DEFAULT_COLOR,
                    opacity: alphaSliderVal,
                  },
                  barWidth: '99.3%',
                };
              }

              return {
                // id: 'xAxisLeft-yAxisTop',
                type: 'scatter',
                data: grid.xCol.resolvedValues.map((d, i) => [d.val, grid.yCol.resolvedValues[i].val]),
                xAxisId: `${grid.xCol.info.id},${grid.yCol.info.id}`,
                yAxisId: `${grid.xCol.info.id},${grid.yCol.info.id}`,
                symbolSize: 7,
                itemStyle: {
                  color: DEFAULT_COLOR,
                  opacity: alphaSliderVal,
                },
                large: true,
              };
            }),
      // : [
      //     {
      //       // id: 'xAxisLeft-yAxisTop',
      //       type: 'scatter',
      //       data: validCols[0].resolvedValues.map((d, i) => [d.val, validCols[1].resolvedValues[i].val]),
      //       xAxisId: 'xAxisLeft-yAxisTop',
      //       yAxisId: 'xAxisLeft-yAxisTop',
      //       name: '1',
      //       symbolSize: 5,
      //       itemStyle: {
      //         opacity: alphaSliderVal,
      //       },
      //       large: true,
      //     },
      //     {
      //       // id: 'xAxisLeft-yAxisBottom',
      //       type: 'scatter',
      //       name: '1',
      //       data: validCols[0].resolvedValues.map((d, i) => [d.val, validCols[1].resolvedValues[i].val]),
      //       xAxisId: 'xAxisLeft-yAxisBottom',
      //       yAxisId: 'xAxisLeft-yAxisBottom',
      //       symbolSize: 5,
      //       itemStyle: {
      //         opacity: alphaSliderVal,
      //       },
      //       large: true,
      //     },
      //     {
      //       // id: 'xAxisRight-yAxisTop',
      //       type: 'scatter',
      //       name: '1',

      //       data: validCols[0].resolvedValues.map((d, i) => [d.val, validCols[1].resolvedValues[i].val]),
      //       xAxisId: 'xAxisRight-yAxisTop',
      //       yAxisId: 'xAxisRight-yAxisTop',
      //       symbolSize: 5,
      //       itemStyle: {
      //         opacity: alphaSliderVal,
      //       },
      //       large: true,
      //     },
      //     {
      //       // id: 'xAxisRight-yAxisBottom',
      //       type: 'scatter',
      //       name: '1',
      //       data: validCols[0].resolvedValues.map((d, i) => [d.val, validCols[1].resolvedValues[i].val]),
      //       xAxisId: 'xAxisRight-yAxisBottom',
      //       yAxisId: 'xAxisRight-yAxisBottom',
      //       symbolSize: 5,
      //       itemStyle: {
      //         opacity: alphaSliderVal,
      //       },
      //       large: true,
      //     },
      //   ],
    });
  }
  // } else {
  //   for (const yCurr of validCols) {
  //     for (const xCurr of validCols) {
  //       // if on the diagonal, make a histogram.
  //       if (xCurr.info.id === yCurr.info.id) {
  //         plots.push({
  //           data: {
  //             x: xCurr.resolvedValues.map((v) => v.val),
  //             xaxis: plotCounter === 1 ? 'x' : `x${plotCounter}`,
  //             yaxis: plotCounter === 1 ? 'y' : `y${plotCounter}`,
  //             type: 'histogram',
  //             hoverlabel: {
  //               namelength: 5,
  //             },
  //             showlegend: false,
  //             marker: {
  //               color: DEFAULT_COLOR,
  //             },
  //             opacity: alphaSliderVal,
  //           },
  //           xLabel: columnNameWithDescription(xCurr.info),
  //           yLabel: columnNameWithDescription(yCurr.info),
  //         });
  //         // otherwise, make a scatterplot
  //       } else {
  //         plots.push({
  //           data: {
  //             x: xCurr.resolvedValues.map((v) => v.val),
  //             y: yCurr.resolvedValues.map((v) => v.val),
  //             ids: xCurr.resolvedValues.map((v) => v.id.toString()),
  //             xaxis: plotCounter === 1 ? 'x' : `x${plotCounter}`,
  //             yaxis: plotCounter === 1 ? 'y' : `y${plotCounter}`,
  //             type: 'scattergl',
  //             mode: 'markers',
  //             hovertext: xCurr.resolvedValues.map(
  //               (v, i) =>
  //                 `${v.id}<br>x: ${v.val}<br>y: ${yCurr.resolvedValues[i].val}<br>${
  //                   colorCol ? `${columnNameWithDescription(colorCol.info)}: ${colorCol.resolvedValues[i].val}` : ''
  //                 }`,
  //             ),
  //             hoverinfo: 'text',
  //             hoverlabel: {
  //               bgcolor: 'black',
  //             },
  //             showlegend: false,
  //             text: validCols[0].resolvedValues.map((v) => v.id.toString()),
  //             marker: {
  //               color: colorCol
  //                 ? colorCol.resolvedValues.map((v) => (colorCol.type === EColumnTypes.NUMERICAL ? numericalColorScale(v.val as number) : scales.color(v.val)))
  //                 : SELECT_COLOR,
  //             },
  //             // plotly is stupid and doesnt know its own types
  //             // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //             // @ts-ignore
  //             selected: {
  //               marker: {
  //                 line: {
  //                   width: 0,
  //                 },
  //                 symbol: shapeCol ? shapeCol.resolvedValues.map((v) => shapeScale(v.val as string)) : 'circle',
  //                 opacity: 1,
  //                 size: 8,
  //               },
  //             },
  //             unselected: {
  //               marker: {
  //                 line: {
  //                   width: 0,
  //                 },
  //                 symbol: shapeCol ? shapeCol.resolvedValues.map((v) => shapeScale(v.val as string)) : 'circle',
  //                 color: DEFAULT_COLOR,
  //                 opacity: alphaSliderVal,
  //                 size: 8,
  //               },
  //             },
  //           },
  //           xLabel: columnNameWithDescription(xCurr.info),
  //           yLabel: columnNameWithDescription(yCurr.info),
  //         });
  //       }

  //       plotCounter += 1;
  //     }
  //   }
  // }

  // // if we have a column for the color, and its a categorical column, add a legendPlot that creates a legend.
  // if (colorCol && colorCol.type === EColumnTypes.CATEGORICAL && validCols.length > 0) {
  //   legendPlots.push({
  //     data: {
  //       x: validCols[0].resolvedValues.map((v) => v.val),
  //       y: validCols[0].resolvedValues.map((v) => v.val),
  //       ids: validCols[0].resolvedValues.map((v) => v.id.toString()),
  //       xaxis: 'x',
  //       yaxis: 'y',
  //       type: 'scattergl',
  //       mode: 'markers',
  //       visible: 'legendonly',
  //       legendgroup: 'color',
  //       hoverinfo: 'skip',

  //       // @ts-ignore
  //       legendgrouptitle: {
  //         text: columnNameWithDescription(colorCol.info),
  //       },
  //       marker: {
  //         line: {
  //           width: 0,
  //         },
  //         symbol: 'circle',
  //         size: 8,
  //         color: colorCol ? colorCol.resolvedValues.map((v) => scales.color(v.val)) : DEFAULT_COLOR,
  //         opacity: 1,
  //       },
  //       transforms: [
  //         {
  //           type: 'groupby',
  //           groups: colorCol.resolvedValues.map((v) => v.val as string),
  //           styles: [
  //             ...[...new Set<string>(colorCol.resolvedValues.map((v) => v.val) as string[])].map((c) => {
  //               return { target: c, value: { name: c } };
  //             }),
  //           ],
  //         },
  //       ],
  //     },
  //     xLabel: columnNameWithDescription(validCols[0].info),
  //     yLabel: columnNameWithDescription(validCols[0].info),
  //   });
  // }

  // // if we have a column for the shape, add a legendPlot that creates a legend.
  // if (shapeCol) {
  //   legendPlots.push({
  //     data: {
  //       x: validCols[0].resolvedValues.map((v) => v.val),
  //       y: validCols[0].resolvedValues.map((v) => v.val),
  //       ids: validCols[0].resolvedValues.map((v) => v.id.toString()),
  //       xaxis: 'x',
  //       yaxis: 'y',
  //       type: 'scattergl',
  //       mode: 'markers',
  //       visible: 'legendonly',
  //       showlegend: true,
  //       legendgroup: 'shape',
  //       hoverinfo: 'skip',

  //       // @ts-ignore
  //       legendgrouptitle: {
  //         text: columnNameWithDescription(shapeCol.info),
  //       },
  //       marker: {
  //         line: {
  //           width: 0,
  //         },
  //         opacity: alphaSliderVal,
  //         size: 8,
  //         symbol: shapeCol ? shapeCol.resolvedValues.map((v) => shapeScale(v.val as string)) : 'circle',
  //         color: DEFAULT_COLOR,
  //       },
  //       transforms: [
  //         {
  //           type: 'groupby',
  //           groups: shapeCol.resolvedValues.map((v) => v.val as string),
  //           styles: [
  //             ...[...new Set<string>(shapeCol.resolvedValues.map((v) => v.val) as string[])].map((c) => {
  //               return { target: c, value: { name: c } };
  //             }),
  //           ],
  //         },
  //       ],
  //     },
  //     xLabel: columnNameWithDescription(validCols[0].info),
  //     yLabel: columnNameWithDescription(validCols[0].info),
  //   });
  // }

  return {
    plots,
    legendPlots,
    rows: Math.sqrt(plots.length),
    cols: Math.sqrt(plots.length),
    errorMessage: I18nextManager.getInstance().i18n.t('tdp:core.vis.scatterError'),
    errorMessageHeader: I18nextManager.getInstance().i18n.t('tdp:core.vis.errorHeader'),
  };
}
