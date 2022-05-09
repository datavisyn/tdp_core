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

function fetchIrisData(): VisColumn[] {
  const dataPromise = import('./categoricalData').then((m) => m.catData);

  return [
    {
      info: {
        description: '',
        id: 'weekDay',
        name: 'Week Day',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.then((data) => data.map((r) => r.weekDay).map((val, i) => ({ id: i.toString(), val }))),
    },
    {
      info: {
        description: '',
        id: 'time',
        name: 'Time',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.then((data) => data.map((r) => r.time).map((val, i) => ({ id: i.toString(), val }))),
    },
  ];
}

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Vis/CategoricalData',
  component: Vis,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
} as ComponentMeta<typeof Vis>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
// eslint-disable-next-line react/function-component-definition
const Template: ComponentStory<typeof Vis> = (args) => {
  const columns = React.useMemo(() => fetchIrisData(), []);
  return <Vis {...args} columns={columns} />;
};

// More on args: https://storybook.js.org/docs/react/writing-stories/args

export const HeatPlot = Template.bind({}) as typeof Template;
HeatPlot.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.HEAT,
    numColumnsSelected: [
      {
        description: '',
        id: 'weekDay',
        name: 'Week Day',
      },
      {
        description: '',
        id: 'time',
        name: 'Time',
      },
    ],
    color: null,
    numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
    shape: null,
    dragMode: EScatterSelectSettings.RECTANGLE,
    alphaSliderVal: 1,
  },
};
