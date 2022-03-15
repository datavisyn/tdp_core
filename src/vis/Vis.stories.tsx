import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Vis } from './Vis';
import { EColumnTypes, VisColumn } from './interfaces';

function fetchData(numberOfPoints: number): VisColumn[] {
  const dataGetter = async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 1500);
    });

    return {
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
    };
  };

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
  title: 'Example/Vis',
  component: Vis,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    pointCount: { control: 'number' },
  },
  args: {
    pointCount: 1000,
  },
} as ComponentMeta<typeof Vis>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
// eslint-disable-next-line react/function-component-definition
const Template: ComponentStory<typeof Vis> = (args) => {
  // @ts-ignore TODO: The pointCount is an injected property, but we are using typeof Vis such that this prop does not exist.
  const columns = React.useMemo(() => fetchData(args.pointCount), [args.pointCount]);

  return <Vis {...args} columns={columns} />;
};

export const Default = Template.bind({}) as typeof Template;
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {};
