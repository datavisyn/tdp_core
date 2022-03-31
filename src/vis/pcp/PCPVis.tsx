import * as React from 'react';
import { merge, uniqueId } from 'lodash';
import { useMemo, useEffect } from 'react';
import { VisColumn, IVisConfig, IPCPConfig } from '../interfaces';
import { PlotlyComponent, Plotly } from '../Plot';
import { InvalidCols } from '../general';
import { createPCPTraces } from './utils';
import { useAsync } from '../../hooks';
import { PCPVisSidebar } from './PCPVisSidebar';

interface PCPVisProps {
  config: IPCPConfig;
  extensions?: {
    prePlot?: React.ReactNode;
    postPlot?: React.ReactNode;
    preSidebar?: React.ReactNode;
    postSidebar?: React.ReactNode;
  };
  columns: VisColumn[];
  setConfig: (config: IVisConfig) => void;
  selected?: { [key: string]: boolean };
  hideSidebar?: boolean;
}

const defaultExtensions = {
  prePlot: null,
  postPlot: null,
  preSidebar: null,
  postSidebar: null,
};

export function PCPVis({ config, extensions, columns, setConfig, selected = {}, hideSidebar = false }: PCPVisProps) {
  const mergedExtensions = useMemo(() => {
    return merge({}, defaultExtensions, extensions);
  }, [extensions]);

  const { value: traces, status: traceStatus, error: traceError } = useAsync(createPCPTraces, [columns, config, selected]);

  const id = React.useMemo(() => uniqueId('PCPVis'), []);

  useEffect(() => {
    if (hideSidebar) {
      return;
    }
    const menu = document.getElementById(`generalVisBurgerMenu${id}`);

    menu.addEventListener('hidden.bs.collapse', () => {
      Plotly.Plots.resize(document.getElementById(`plotlyDiv${id}`));
    });

    menu.addEventListener('shown.bs.collapse', () => {
      Plotly.Plots.resize(document.getElementById(`plotlyDiv${id}`));
    });
  }, [hideSidebar, id]);

  const layout = React.useMemo<Partial<Plotly.Layout> | null>(() => {
    return traces
      ? {
          showlegend: true,
          autosize: true,
          grid: { rows: traces.rows, columns: traces.cols, xgap: 0.3, pattern: 'independent' },
          shapes: [],
          violingap: 0,
        }
      : null;
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
            onRestyle={(style) => {
              console.log(style);
            }}
            data={[...traces.plots.map((p) => p.data), ...traces.legendPlots.map((p) => p.data)]}
            layout={layout}
            config={{ responsive: true, displayModeBar: false }}
            useResizeHandler
            style={{ width: '100%', height: '100%' }}
            // plotly redraws everything on updates, so you need to reappend title and
            // change opacity on update, instead of just in a use effect
          />
        ) : traceStatus !== 'pending' ? (
          <InvalidCols headerMessage={traces?.errorMessageHeader} bodyMessage={traceError?.message || traces?.errorMessage} />
        ) : null}
        {mergedExtensions.postPlot}
      </div>
      {!hideSidebar ? (
        <div className="position-relative h-100 flex-shrink-1 bg-light overflow-auto mt-2">
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
            <PCPVisSidebar config={config} extensions={extensions} columns={columns} setConfig={setConfig} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
