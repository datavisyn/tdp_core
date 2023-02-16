import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Vis } from '../../../LazyVis';
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
} from '../../../interfaces';

function fetchIrisData(): VisColumn[] {
  const dataPromise = import('../../irisData').then((m) => m.iris);

  return [
    {
      info: {
        description: '',
        id: 'sepalLength',
        name: 'Sepal Length',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.then((data) => data.map((r) => r.sepalLength).map((val, i) => ({ id: i.toString(), val }))),
    },
    {
      info: {
        description: '',
        id: 'sepalWidth',
        name: 'Sepal Width',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.then((data) => data.map((r) => r.sepalWidth).map((val, i) => ({ id: i.toString(), val }))),
    },
    {
      info: {
        description: '',
        id: 'petalLength',
        name: 'Petal Length',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.then((data) => data.map((r) => r.petalLength).map((val, i) => ({ id: i.toString(), val }))),
    },
    {
      info: {
        description: '',
        id: 'petalWidth',
        name: 'Petal Width',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.then((data) => data.map((r) => r.petalWidth).map((val, i) => ({ id: i.toString(), val }))),
    },
    {
      info: {
        description: '',
        id: 'species',
        name: 'Species',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.then((data) => data.map((r) => r.species).map((val, i) => ({ id: i.toString(), val }))),
    },
  ];
}

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Vis/Scatter',
  component: Vis,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
} as ComponentMeta<typeof Vis>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
// eslint-disable-next-line react/function-component-definition
const Template: ComponentStory<typeof Vis> = (args) => {
  const columns = React.useMemo(() => fetchIrisData(), []);
  return (
    <div style={{ height: '100vh', width: '100%', display: 'flex', justifyContent: 'center', alignContent: 'center', flexWrap: 'wrap' }}>
      <div style={{ width: '70%', height: '80%' }}>
        <Vis {...args} columns={columns} />
      </div>
    </div>
  );
};

// More on args: https://storybook.js.org/docs/react/writing-stories/args

export const Basic = Template.bind({}) as typeof Template;
Basic.args = {
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
    dragMode: EScatterSelectSettings.RECTANGLE,
    alphaSliderVal: 1,
  },
};

export const ColorByCategory = Template.bind({}) as typeof Template;
ColorByCategory.args = {
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
    color: {
      description: '',
      id: 'species',
      name: 'Species',
    },
    numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
    shape: null,
    dragMode: EScatterSelectSettings.RECTANGLE,
    alphaSliderVal: 0.5,
  },
};

export const ColorByNumerical = Template.bind({}) as typeof Template;
ColorByNumerical.args = {
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
    color: {
      description: '',
      id: 'petalLength',
      name: 'Petal Length',
    },
    numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
    shape: null,
    dragMode: EScatterSelectSettings.RECTANGLE,
    alphaSliderVal: 0.5,
  },
};

export const SmallMultiples = Template.bind({}) as typeof Template;
SmallMultiples.args = {
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
      {
        description: '',
        id: 'petalLength',
        name: 'Petal Length',
      },
    ],
    color: null,
    numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
    shape: null,
    dragMode: EScatterSelectSettings.RECTANGLE,
    alphaSliderVal: 0.5,
  },
};
