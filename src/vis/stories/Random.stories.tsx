import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Vis } from '../Vis';
import {
  EAggregateTypes,
  EBarDirection,
  EBarDisplayType,
  EBarGroupingType,
  EColumnTypes,
  ENumericalColorScaleType,
  EScatterSelectSettings,
  ESupportedPlotlyVis,
  EViolinOverlay,
  VisColumn,
} from '../interfaces';

function fetchData(numberOfPoints: number): VisColumn[] {
  const dataGetter = async () => ({
    value: Array(numberOfPoints)
      .fill(null)
      .map(() => Math.random() * 100),
    pca_x: Array(numberOfPoints)
      .fill(null)
      .map(() => Math.random() * 100),
    pca_y: Array(numberOfPoints)
      .fill(null)
      .map(() => Math.random() * 100),
    category: Array(numberOfPoints)
      .fill(null)
      .map(() => parseInt((Math.random() * 2).toString(), 2).toString()),
  });

  const dataPromise = dataGetter();

  return [
    {
      info: {
        description: '',
        id: 'pca_x',
        name: 'pca_x',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.then((data) => data.pca_x.map((val, i) => ({ id: i.toString(), val }))),
    },
    {
      info: {
        description: '',
        id: 'pca_y',
        name: 'pca_y',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.then((data) => data.pca_y.map((val, i) => ({ id: i.toString(), val }))),
    },
    {
      info: {
        description: '',
        id: 'value',
        name: 'value',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.then((data) => data.value.map((val, i) => ({ id: i.toString(), val }))),
    },
    {
      info: {
        description: '',
        id: 'category',
        name: 'category',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.then((data) => data.category.map((val, i) => ({ id: i.toString(), val }))),
    },
  ];
}

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Vis/RandomData',
  component: Vis,
  argTypes: {
    pointCount: { control: 'number' },
  },
  args: {
    pointCount: 100000,
  },
} as ComponentMeta<typeof Vis>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
// eslint-disable-next-line react/function-component-definition
const Template: ComponentStory<typeof Vis> = (args) => {
  // @ts-ignore TODO: The pointCount is an injected property, but we are using typeof Vis such that this prop does not exist.
  const columns = React.useMemo(() => fetchData(args.pointCount), [args.pointCount]);

  return (
    <div style={{ height: '100vh', width: '100%', display: 'flex', justifyContent: 'center', alignContent: 'center', flexWrap: 'wrap' }}>
      <div style={{ width: '70%', height: '80%' }}>
        <Vis {...args} columns={columns} />
      </div>
    </div>
  );
};
// More on args: https://storybook.js.org/docs/react/writing-stories/args

export const ScatterPlot = Template.bind({}) as typeof Template;
ScatterPlot.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.SCATTER,
    numColumnsSelected: [
      {
        description: '',
        id: 'pca_x',
        name: 'pca_x',
      },
      {
        description: '',
        id: 'pca_y',
        name: 'pca_y',
      },
    ],
    color: null,
    numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
    shape: null,
    dragMode: EScatterSelectSettings.RECTANGLE,
    alphaSliderVal: 1,
  },
};

export const BarChart = Template.bind({}) as typeof Template;
BarChart.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.BAR,
    multiples: null,
    group: null,
    direction: EBarDirection.VERTICAL,
    display: EBarDisplayType.ABSOLUTE,
    groupType: EBarGroupingType.GROUP,
    numColumnsSelected: [],
    catColumnSelected: {
      description: '',
      id: 'category',
      name: 'category',
    },
    aggregateColumn: null,
    aggregateType: EAggregateTypes.COUNT,
  },
};

export const ViolinPlot = Template.bind({}) as typeof Template;
ViolinPlot.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.VIOLIN,
    numColumnsSelected: [
      {
        description: '',
        id: 'pca_x',
        name: 'pca_x',
      },
      {
        description: '',
        id: 'pca_y',
        name: 'pca_y',
      },
    ],
    catColumnsSelected: [],
    violinOverlay: EViolinOverlay.NONE,
  },
};
