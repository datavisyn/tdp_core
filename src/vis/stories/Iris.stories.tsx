import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Vis } from '../Vis';
import {
  EBarDirection,
  EBarDisplayType,
  EBarGroupingType,
  EColumnTypes,
  ENumericalColorScaleType,
  ESupportedPlotlyVis,
  EViolinOverlay,
  VisColumn,
} from '../interfaces';
import { iris } from './irisData';

function fetchIrisData(): VisColumn[] {
  const dataGetter = async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 1500);
    });

    return {
      sepalLength: iris.map((row) => row.sepalLength),
      sepalWidth: iris.map((row) => row.sepalWidth),
      petalLength: iris.map((row) => row.petalLength),
      petalWidth: iris.map((row) => row.petalWidth),
      species: iris.map((row) => row.species),
    };
  };

  const dataPromise = dataGetter();

  return [
    {
      info: {
        description: '',
        id: 'sepalLength',
        name: 'Sepal Length',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.then((data) => data.sepalLength.map((val, i) => ({ id: i.toString(), val }))),
    },
    {
      info: {
        description: '',
        id: 'sepalWidth',
        name: 'Sepal Width',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.then((data) => data.sepalWidth.map((val, i) => ({ id: i.toString(), val }))),
    },
    {
      info: {
        description: '',
        id: 'petalLength',
        name: 'Petal Length',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.then((data) => data.petalLength.map((val, i) => ({ id: i.toString(), val }))),
    },
    {
      info: {
        description: '',
        id: 'petalWidth',
        name: 'Petal Width',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.then((data) => data.petalWidth.map((val, i) => ({ id: i.toString(), val }))),
    },
    {
      info: {
        description: '',
        id: 'species',
        name: 'Species',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.then((data) => data.species.map((val, i) => ({ id: i.toString(), val }))),
    },
  ];
}

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Vis/IrisData',
  component: Vis,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
} as ComponentMeta<typeof Vis>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
// eslint-disable-next-line react/function-component-definition
const Template: ComponentStory<typeof Vis> = (args) => {
  // @ts-ignore TODO: The pointCount is an injected property, but we are using typeof Vis such that this prop does not exist.
  const columns = React.useMemo(() => fetchIrisData(), []);

  return <Vis {...args} columns={columns} />;
};

// More on args: https://storybook.js.org/docs/react/writing-stories/args

export const ScatterPlot = Template.bind({}) as typeof Template;
ScatterPlot.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.SCATTER,
    numColumnsSelected: [
      {
        description: '',
        id: 'sepalLength',
        name: 'Sepal Length',
      },
      {
        description: '',
        id: 'sepalWidth',
        name: 'Sepal Width',
      },
    ],
    color: null,
    numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
    shape: null,
    isRectBrush: true,
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
    display: EBarDisplayType.DEFAULT,
    groupType: EBarGroupingType.GROUP,
    numColumnsSelected: [],
    catColumnsSelected: [
      {
        description: '',
        id: 'species',
        name: 'Species',
      },
    ],
  },
};

export const ViolinPlot = Template.bind({}) as typeof Template;
ViolinPlot.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.VIOLIN,
    numColumnsSelected: [
      {
        description: '',
        id: 'sepalLength',
        name: 'Sepal Length',
      },
      {
        description: '',
        id: 'sepalWidth',
        name: 'Sepal Width',
      },
    ],
    catColumnsSelected: [],
    violinOverlay: EViolinOverlay.NONE,
  },
};

export const StripPlot = Template.bind({}) as typeof Template;
StripPlot.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.STRIP,
    numColumnsSelected: [
      {
        description: '',
        id: 'sepalLength',
        name: 'Sepal Length',
      },
      {
        description: '',
        id: 'sepalWidth',
        name: 'Sepal Width',
      },
    ],
    catColumnsSelected: [],
  },
};

export const ParallelCoordinatesPlot = Template.bind({}) as typeof Template;
ParallelCoordinatesPlot.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.PCP,
    allColumnsSelected: [
      {
        description: '',
        id: 'sepalLength',
        name: 'Sepal Length',
      },
      {
        description: '',
        id: 'sepalWidth',
        name: 'Sepal Width',
      },
    ],
  },
};
