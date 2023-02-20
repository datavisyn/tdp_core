import React from 'react';
import { ComponentStory, ComponentMeta, Meta } from '@storybook/react';
import { Vis } from '../../../LazyVis';
import {
  EAggregateTypes,
  EBarDirection,
  EBarDisplayType,
  EBarGroupingType,
  EColumnTypes,
  EHexbinOptions,
  ENumericalColorScaleType,
  EScatterSelectSettings,
  ESupportedPlotlyVis,
  EViolinOverlay,
  VisColumn,
} from '../../../interfaces';

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
      .map(() => parseInt((Math.random() * 10).toString(), 10).toString()),
    category2: Array(numberOfPoints)
      .fill(null)
      .map(() => parseInt((Math.random() * 5).toString(), 5).toString()),
    category3: Array(numberOfPoints)
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
      domain: [0, undefined],
      values: () => dataPromise.then((data) => data.pca_x.map((val, i) => ({ id: i.toString(), val }))),
    },
    {
      info: {
        description: '',
        id: 'pca_y',
        name: 'pca_y',
      },
      type: EColumnTypes.NUMERICAL,
      domain: [0, undefined],
      values: () => dataPromise.then((data) => data.pca_y.map((val, i) => ({ id: i.toString(), val }))),
    },
    {
      info: {
        description: '',
        id: 'value',
        name: 'value',
      },
      domain: [0, 100],

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
    {
      info: {
        description: '',
        id: 'category2',
        name: 'category2',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.then((data) => data.category2.map((val, i) => ({ id: i.toString(), val }))),
    },
    {
      info: {
        description: '',
        id: 'category3',
        name: 'category3',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.then((data) => data.category3.map((val, i) => ({ id: i.toString(), val }))),
    },
  ];
}

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Vis/Bar',
  component: Vis,
  argTypes: {
    pointCount: { control: 'number' },
  },
  args: {
    pointCount: 10000,
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

export const Basic = Template.bind({}) as typeof Template;
Basic.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.BAR,
    catColumnSelected: {
      description: '',
      id: 'category',
      name: 'category',
    },
    multiples: null,
    group: null,
    groupType: EBarGroupingType.GROUP,
    direction: EBarDirection.HORIZONTAL,
    display: EBarDisplayType.ABSOLUTE,
    aggregateType: EAggregateTypes.COUNT,
    aggregateColumn: null,
    numColumnsSelected: [],
  },
};

export const Vertical = Template.bind({}) as typeof Template;
Vertical.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.BAR,
    catColumnSelected: {
      description: '',
      id: 'category',
      name: 'category',
    },
    multiples: null,
    group: null,
    groupType: EBarGroupingType.GROUP,
    direction: EBarDirection.VERTICAL,
    display: EBarDisplayType.ABSOLUTE,
    aggregateType: EAggregateTypes.COUNT,
    aggregateColumn: null,
    numColumnsSelected: [],
  },
};

export const Grouped = Template.bind({}) as typeof Template;
Grouped.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.BAR,
    catColumnSelected: {
      description: '',
      id: 'category',
      name: 'category',
    },
    multiples: null,
    group: {
      description: '',
      id: 'category2',
      name: 'category2',
    },
    groupType: EBarGroupingType.GROUP,
    direction: EBarDirection.HORIZONTAL,
    display: EBarDisplayType.ABSOLUTE,
    aggregateType: EAggregateTypes.COUNT,
    aggregateColumn: null,
    numColumnsSelected: [],
  },
};

export const Multiples = Template.bind({}) as typeof Template;
Multiples.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.BAR,
    catColumnSelected: {
      description: '',
      id: 'category',
      name: 'category',
    },
    multiples: {
      description: '',
      id: 'category2',
      name: 'category2',
    },
    group: null,
    groupType: EBarGroupingType.GROUP,
    direction: EBarDirection.HORIZONTAL,
    display: EBarDisplayType.ABSOLUTE,
    aggregateType: EAggregateTypes.COUNT,
    aggregateColumn: null,
    numColumnsSelected: [],
  },
};

export const AggregateAverage = Template.bind({}) as typeof Template;
AggregateAverage.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.BAR,
    catColumnSelected: {
      description: '',
      id: 'category',
      name: 'category',
    },
    multiples: null,
    group: null,
    groupType: EBarGroupingType.GROUP,
    direction: EBarDirection.HORIZONTAL,
    display: EBarDisplayType.ABSOLUTE,
    aggregateType: EAggregateTypes.AVG,
    aggregateColumn: {
      description: '',
      id: 'value',
      name: 'value',
    },
    numColumnsSelected: [],
  },
};
