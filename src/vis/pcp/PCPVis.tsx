import * as React from 'react';
import { merge, uniqueId } from 'lodash';
import { useMemo, useEffect } from 'react';
import { VisColumn, IVisConfig, IPCPConfig } from '../interfaces';
import { PlotlyComponent } from '../Plot';
import { Plotly } from '../../plotly';
import { InvalidCols } from '../general';
import { createPCPTraces } from './utils';
import { useAsync } from '../../hooks';
import { PCPVisSidebar } from './PCPVisSidebar';
import { VisSidebarWrapper } from '../VisSidebarWrapper';
import { CloseButton } from '../sidebar/CloseButton';

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
  closeButtonCallback?: () => void;
  showCloseButton?: boolean;
}

const defaultExtensions = {
  prePlot: null,
  postPlot: null,
  preSidebar: null,
  postSidebar: null,
};

export function PCPVis({
  config,
  extensions,
  columns,
  setConfig,
  showCloseButton = false,
  closeButtonCallback = () => null,
  selected = {},
  hideSidebar = false,
}: PCPVisProps) {
  const mergedExtensions = useMemo(() => {
    return merge({}, defaultExtensions, extensions);
  }, [extensions]);

  const { value: traces, status: traceStatus, error: traceError } = useAsync(createPCPTraces, [columns, config, selected]);

  const id = React.useMemo(() => uniqueId('PCPVis'), []);

  const plotlyDivRef = React.useRef(null);

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      Plotly.Plots.resize(document.getElementById(`plotlyDiv${id}`));
    });

    if (plotlyDivRef) {
      ro.observe(plotlyDivRef.current);
    }

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
  }, [id, hideSidebar, plotlyDivRef]);

  const layout = React.useMemo<Partial<Plotly.Layout> | null>(() => {
    return traces
      ? {
          showlegend: true,
          autosize: true,
          grid: { rows: traces.rows, columns: traces.cols, xgap: 0.3, pattern: 'independent' },
          font: {
            family: 'Roboto, sans-serif',
          },
          shapes: [],
          violingap: 0,
        }
      : null;
  }, [traces]);

  return (
    <div ref={plotlyDivRef} className="d-flex flex-row w-100 h-100" style={{ minHeight: '0px' }}>
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
            // change opacity on update, instead of just in a use effect
          />
        ) : traceStatus !== 'pending' ? (
          <InvalidCols headerMessage={traces?.errorMessageHeader} bodyMessage={traceError?.message || traces?.errorMessage} />
        ) : null}
        {mergedExtensions.postPlot}
        {showCloseButton ? <CloseButton closeCallback={closeButtonCallback} /> : null}
      </div>
      {!hideSidebar ? (
        <VisSidebarWrapper id={id}>
          <PCPVisSidebar config={config} extensions={extensions} columns={columns} setConfig={setConfig} />
        </VisSidebarWrapper>
      ) : null}
    </div>
  );
}
