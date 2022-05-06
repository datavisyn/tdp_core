import * as React from 'react';
import { uniqueId } from 'lodash';
import { PlotlyComponent } from '../Plot';
import { ISankeyConfig, IVisConfig, PlotlyData, PlotlyInfo, VisCategoricalColumn, VisColumn } from '../interfaces';
import { SankeyVisSidebar } from './SankeyVisSidebar';
import { resolveColumnValues } from '../general/layoutUtils';
import { useAsync } from '../../hooks/useAsync';

const layout = {
  title: 'Basic Sankey',
  font: {
    size: 10,
  },
};

export async function createSankeyTraces(columns: VisColumn[], config: ISankeyConfig): Promise<any> {
  const catCols: VisCategoricalColumn[] = config.catColumnsSelected.map((c) => columns.find((col) => col.info.id === c.id) as VisCategoricalColumn);
  const plots: PlotlyData[] = [];

  const catColValues = await resolveColumnValues(catCols);

  console.log(catColValues);

  return catColValues;
}

interface SankeyVisProps {
  config: ISankeyConfig;
  setConfig: (config: IVisConfig) => void;
  columns: VisColumn[];
}

function TransposeData(
  data: {
    info: { description: string; id: string; name: string };
    resolvedValues: {
      id: any;
      val: any;
    }[];
  }[],
) {
  /**
   * 
   moritz      heckmann      thomas
   moritz      heckmann      dreist
   thomas      horst         moritz
   moritz      test          thomas
   */
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

export function SankeyVis({ config, setConfig, columns }: SankeyVisProps) {
  const id = React.useMemo(() => uniqueId('SankeyVis'), []);

  const { value: traces, status: traceStatus, error: traceError } = useAsync(createSankeyTraces, [columns, config]);

  return (
    <div className="d-flex flex-row w-100 h-100" style={{ minHeight: '0px' }}>
      <div className={`position-relative d-flex justify-content-center align-items-center flex-grow-1 `}>
        <PlotlyComponent
          divId={`plotlyDiv${id}`}
          data={data}
          layout={layout}
          onClick={(sel: any) => {
            console.log(sel.points[0]);
          }}
        />

        <SankeyVisSidebar config={config} setConfig={setConfig} columns={columns} />
      </div>
    </div>
  );
}
