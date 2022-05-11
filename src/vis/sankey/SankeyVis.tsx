import * as React from 'react';
import {uniqueId, values} from 'lodash';
import {PlotlyComponent} from '../Plot';
import {ISankeyConfig, IVisConfig, PlotlyData, VisCategoricalColumn, VisColumn} from '../interfaces';
import {SankeyVisSidebar} from './SankeyVisSidebar';
import {resolveColumnValues} from '../general/layoutUtils';
import {useAsync} from '../../hooks/useAsync';


const NODE_SELECTION_COLOR = 'rgba(51, 122, 183, 1)';
const NODE_DEFAULT_COLOR = 'rgba(51, 122, 183, 1)';

const LINK_SELECTION_COLOR = 'rgba(51, 122, 183, 0.2)';
const LINK_DEFAULT_COLOR = 'rgba(68, 68, 68, 0.2)';


const layout = {
  title: 'Basic Sankey',
  font: {
    size: 10,
  },
};

interface SankeyVisProps {
  config: ISankeyConfig;
  setConfig: (config: IVisConfig) => void;
  columns: VisColumn[];
}


/**
 * Performs the data transformation that maps the fetched data to
 * a Plotly.js compatible format
 * 
 * @param data the fetched data
 * @returns a plotly spec
 */
function TransposeData(
  data: {
    info: {description: string; id: string; name: string};
    resolvedValues: {
      id: any;
      val: any;
    }[];
  }[],
) {

  const selection = new Set<string>('0');
  let nodeIndex = 0;

  const plotly = {
    nodes: {
      labels: new Array<string>(),
      color: new Array<string>(),
      inverseLookup: []
    },
    links: {
      source: new Array<number>(),
      target: new Array<number>(),
      value: new Array<number>(),
      color: new Array<string>(),
      inverseLookup: []
    }
  }

  if (data.length < 2) {
    return null;
  }

  const lanes = data.map((lane) => {
    const values = lane.resolvedValues.map((value) => value.val as string)
    //const nodes = Array.from(new Set(values)).map((value) => ({id: nodeIndex++, value}))
    const nodes = new Array<{id: number, value: any, inverseLookup: string[]}>();

    const nodesSet = new Set<string>();
    lane.resolvedValues.forEach((value) => {
      if (nodesSet.has(value.val)) {
        nodes.find((node) => node.value === value.val).inverseLookup.push(value.id)
      } else {
        nodes.push({id: nodeIndex++, value: value.val, inverseLookup: [value.id]})
        nodesSet.add(value.val)
      }
    })

    for (const node of nodes) {
      plotly.nodes.labels.push(node.value)
      plotly.nodes.color.push(NODE_DEFAULT_COLOR)
      plotly.nodes.inverseLookup.push(node.inverseLookup)
    }

    return {
      info: lane.info,
      nodes,
      values
    }
  })

  lanes.forEach((lane, i) => {
    if (i === lanes.length - 1) {
      return;
    }

    const next = lanes[i + 1];
    const links: {[index: string]: {[index: string]: {count: number, inverseLookup: string[]}}} = {};

    lane.values.forEach((left, vi) => {
      const right = next.values[vi]

      if (left in links) {
        if (right in links[left]) {
          links[left][right].count = links[left][right].count + 1;
          links[left][right].inverseLookup.push(vi.toString());
        } else {
          links[left][right] = {count: 1, inverseLookup: [vi.toString()]};
        }
      } else {
        links[left] = {
          [right]: {
            count: 1,
            inverseLookup: [vi.toString()]
          }
        };
      }
    })

    for (const lik in links) {
      for (const rik in links[lik]) {
        plotly.links.source.push(lane.nodes.find((node) => node.value === lik).id);
        plotly.links.target.push(next.nodes.find((node) => node.value === rik).id);
        plotly.links.value.push(links[lik][rik].count);
        plotly.links.color.push(LINK_DEFAULT_COLOR);
        plotly.links.inverseLookup.push(links[lik][rik].inverseLookup);
      }
    }
  })

  return plotly;
}

export async function fetchData(columns: VisColumn[], config: ISankeyConfig) {
  const catCols: VisCategoricalColumn[] = config.catColumnsSelected.map((c) => columns.find((col) => col.info.id === c.id) as VisCategoricalColumn);
  const plots: PlotlyData[] = [];

  const catColValues2 = await resolveColumnValues(catCols);

  return TransposeData(catColValues2)
}

function isNodeSelected(selection: Set<string>, inverseLookup: Array<string>) {
  for (const value of inverseLookup) {
    if (selection.has(value)) {
      return true
    }
  }

  return false
}

function generatePlotly(data, optimisedSelection) {
  return [{
    type: 'sankey',
    arrangement: 'fixed',
    orientation: 'h',
    node: {
      pad: 15,
      thickness: 30,
      line: {
        color: 'black',
        width: 0.5,
      },
      label: data.nodes.labels,
      color: data.nodes.color.map((color, i) => isNodeSelected(optimisedSelection, data.nodes.inverseLookup[i]) ? NODE_SELECTION_COLOR : 'rgba(51, 122, 183, 0.2)')
    },
    link: {
      ...data.links,
      color: data.links.color.map((color, i) => isNodeSelected(optimisedSelection, data.links.inverseLookup[i]) ? 'rgba(51, 122, 183, 0.2)' : 'rgba(68, 68, 68, 0.2)')
    },
  }]
}

export function SankeyVis({config, setConfig, columns}: SankeyVisProps) {
  const id = React.useMemo(() => uniqueId('SankeyVis'), []);

  const [selection, setSelection] = React.useState<string[]>([])

  const {value: data} = useAsync(fetchData, [columns, config]);

  const [plotly, setPlotly] = React.useState<any[]>();

  // When we have new data -> recreate plotly
  React.useEffect(() => {
    const optimisedSelection = new Set(selection);

    if (!data) {
      setPlotly(null);
    } else {
      setPlotly(generatePlotly(data, optimisedSelection))
    }
  }, [data])


  // When selection changes and we have data -> recreate plotly
  React.useEffect(() => {
    if (data) {
      const optimisedSelection = new Set(selection);

      setPlotly(generatePlotly(data, optimisedSelection))
    }
  }, [selection])


  return (
    <div className="d-flex flex-row w-100 h-100" style={{minHeight: '0px'}}>
      <div className={`position-relative d-flex justify-content-center align-items-center flex-grow-1 `}>
        {plotly ?
          <PlotlyComponent
            divId={`plotlyDiv${id}`}
            data={plotly}
            layout={layout}
            onClick={(sel: any) => {
              if (!sel.points[0]) {
                return;
              }

              const element = sel.points[0];

              if ('sourceLinks' in element) {
                // node
                setSelection(data.nodes.inverseLookup[element.index])
              } else {
                // link
                setSelection(data.links.inverseLookup[element.index])
              }
            }}
          /> : <p className="h4">Select at least 2 categorical attributes.</p>}

        <SankeyVisSidebar config={config} setConfig={setConfig} columns={columns} />
      </div>
    </div>
  );
}
