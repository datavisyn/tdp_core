import * as React from 'react';
import Plot from 'react-plotly.js';
import { ISankeyConfig } from '../interfaces';

const layout = {
  title: 'Basic Sankey',
  font: {
    size: 10,
  },
};

interface SankeyVisProps {
  config: ISankeyConfig;
}
const data = [
  {
    type: 'sankey',
    orientation: 'h',
    node: {
      pad: 15,
      thickness: 30,
      line: {
        color: 'black',
        width: 0.5,
      },
      label: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
      color: ['blue', 'blue', 'blue', 'blue', 'blue', 'blue'],
    },

    link: {
      source: [0, 1, 0, 2, 3, 3],
      target: [2, 3, 3, 4, 4, 5],
      value: [8, 4, 9, 8, 4, 2],
    },
  },
];
export function SankeyVis({ config }: SankeyVisProps) {
  return (
    <Plot
      data={data}
      layout={layout}
      onClick={(sel: any) => {
        console.log(sel.points[0]);
      }}
    />
  );
}
