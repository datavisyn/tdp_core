import * as React from 'react';
import d3 from 'd3';
import { merge, uniqueId } from 'lodash';
import { IVisConfig, ColumnInfo, ESupportedPlotlyVis, VisColumn, IStripConfig, Scales } from '../interfaces';
import { CategoricalColumnSelect, NumericalColumnSelect, VisTypeSelect, WarningMessage } from '../sidebar';
import { PlotlyComponent, Plotly } from '../Plot';
import { InvalidCols } from '../general';
import { beautifyLayout } from '../general/layoutUtils';
import { createStripTraces } from './utils';
import { useAsync } from '../../hooks';

interface StripVisProps {
  config: IStripConfig;
  extensions?: {
    prePlot?: React.ReactNode;
    postPlot?: React.ReactNode;
    preSidebar?: React.ReactNode;
    postSidebar?: React.ReactNode;
  };
  columns: VisColumn[];
  setConfig: (config: IVisConfig) => void;
  scales: Scales;
}

const defaultExtensions = {
  prePlot: null,
  postPlot: null,
  preSidebar: null,
  postSidebar: null,
};

export function StripVis({ config, extensions, columns, setConfig, scales }: StripVisProps) {
  const mergedExtensions = React.useMemo(() => {
    return merge({}, defaultExtensions, extensions);
  }, [extensions]);

  const { value: traces, status: traceStatus, error: traceError } = useAsync(createStripTraces, [columns, config, scales]);

  const id = React.useMemo(() => uniqueId('StripVis'), []);

  React.useEffect(() => {
    const menu = document.getElementById(`generalVisBurgerMenu${id}`);

    menu.addEventListener('hidden.bs.collapse', () => {
      Plotly.Plots.resize(document.getElementById(`plotlyDiv${id}`));
    });

    menu.addEventListener('shown.bs.collapse', () => {
      Plotly.Plots.resize(document.getElementById(`plotlyDiv${id}`));
    });
  }, [id]);

  const layout = React.useMemo(() => {
    if (!traces) {
      return null;
    }

    const innerLayout: Plotly.Layout = {
      showlegend: true,
      legend: {
        // @ts-ignore
        itemclick: false,
        itemdoubleclick: false,
      },
      autosize: true,
      grid: { rows: traces.rows, columns: traces.cols, xgap: 0.3, pattern: 'independent' },
      shapes: [],
      violingap: 0,
    };

    return beautifyLayout(traces, innerLayout);
  }, [traces]);

  return (
    <div className="d-flex flex-row w-100 h-100" style={{ minHeight: '0px' }}>
      <div
        className={`position-relative d-flex justify-content-center align-items-center flex-grow-1 ${
          traceStatus === 'pending' ? 'tdp-busy-partial-overlay' : ''
        }`}
      >
        {mergedExtensions.prePlot}

        {traceStatus === 'success' && traces?.plots.length > 0 ? (
          <PlotlyComponent
            divId={`plotlyDiv${id}`}
            data={[...traces.plots.map((p) => p.data), ...traces.legendPlots.map((p) => p.data)]}
            layout={layout}
            config={{ responsive: true, displayModeBar: false }}
            useResizeHandler
            style={{ width: '100%', height: '100%' }}
            // plotly redraws everything on updates, so you need to reappend title and
            onUpdate={() => {
              for (const p of traces.plots) {
                d3.select(`g .${p.data.xaxis}title`).style('pointer-events', 'all').append('title').text(p.xLabel);

                d3.select(`g .${p.data.yaxis}title`).style('pointer-events', 'all').append('title').text(p.yLabel);
              }
            }}
          />
        ) : traceStatus !== 'pending' ? (
          <InvalidCols message={traceError?.message || traces?.errorMessage} />
        ) : null}
        {mergedExtensions.postPlot}
      </div>
      <div className="position-relative h-100 flex-shrink-1 bg-light overflow-auto">
        <button
          className="btn btn-primary-outline"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target={`#generalVisBurgerMenu${id}`}
          aria-expanded="true"
          aria-controls="generalVisBurgerMenu"
        >
          <i className="fas fa-bars" />
        </button>
        <div className="collapse show collapse-horizontal" id={`generalVisBurgerMenu${id}`}>
          <div className="container pb-3" style={{ width: '20rem' }}>
            <WarningMessage />
            <VisTypeSelect callback={(type: ESupportedPlotlyVis) => setConfig({ ...(config as any), type })} currentSelected={config.type} />
            <hr />
            <NumericalColumnSelect
              callback={(numColumnsSelected: ColumnInfo[]) => setConfig({ ...config, numColumnsSelected })}
              columns={columns}
              currentSelected={config.numColumnsSelected || []}
            />
            <CategoricalColumnSelect
              callback={(catColumnsSelected: ColumnInfo[]) => setConfig({ ...config, catColumnsSelected })}
              columns={columns}
              currentSelected={config.catColumnsSelected || []}
            />
            <hr />
            {mergedExtensions.preSidebar}
            {mergedExtensions.postSidebar}
          </div>
        </div>
      </div>
    </div>
  );
}
