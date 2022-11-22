import * as React from 'react';
import d3v3 from 'd3v3';
import { merge, uniqueId } from 'lodash';
import { useMemo, useEffect } from 'react';
import { IVisConfig, VisColumn, IStripConfig, Scales } from '../interfaces';
import { PlotlyComponent, Plotly } from '../Plot';
import { InvalidCols } from '../general';
import { beautifyLayout } from '../general/layoutUtils';
import { createStripTraces } from './utils';
import { useAsync } from '../../hooks';
import { StripVisSidebar } from './StripVisSidebar';
import { VisSidebarWrapper } from '../VisSidebarWrapper';
import { CloseButton } from '../sidebar/CloseButton';

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
  selectionCallback?: (s: string[]) => void;
  closeButtonCallback?: () => void;
  selected?: { [key: string]: boolean };
  hideSidebar?: boolean;
  showCloseButton?: boolean;
}

const defaultExtensions = {
  prePlot: null,
  postPlot: null,
  preSidebar: null,
  postSidebar: null,
};

export function StripVis({
  config,
  extensions,
  columns,
  setConfig,
  selectionCallback = () => null,
  selected = {},
  scales,
  hideSidebar = false,
  showCloseButton = false,
  closeButtonCallback = () => null,
}: StripVisProps) {
  const mergedExtensions = useMemo(() => {
    return merge({}, defaultExtensions, extensions);
  }, [extensions]);

  const { value: traces, status: traceStatus, error: traceError } = useAsync(createStripTraces, [columns, config, selected, scales]);

  const id = React.useMemo(() => uniqueId('StripVis'), []);

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

  const layout = React.useMemo(() => {
    if (!traces) {
      return null;
    }

    const innerLayout: Partial<Plotly.Layout> = {
      showlegend: true,
      legend: {
        // @ts-ignore
        itemclick: false,
        itemdoubleclick: false,
      },
      font: {
        family: 'Roboto, sans-serif',
      },
      autosize: true,
      grid: { rows: traces.rows, columns: traces.cols, xgap: 0.3, pattern: 'independent' },
      shapes: [],
      dragmode: 'select',
    };

    return beautifyLayout(traces, innerLayout);
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
            onSelected={(sel) => {
              selectionCallback(sel ? sel.points.map((d) => (d as any).id) : []);
            }}
            // plotly redraws everything on updates, so you need to reappend title and
            onUpdate={() => {
              for (const p of traces.plots) {
                d3v3.select(`g .${p.data.xaxis}title`).style('pointer-events', 'all').append('title').text(p.xLabel);

                d3v3.select(`g .${p.data.yaxis}title`).style('pointer-events', 'all').append('title').text(p.yLabel);
              }
            }}
          />
        ) : traceStatus !== 'pending' ? (
          <InvalidCols headerMessage={traces?.errorMessageHeader} bodyMessage={traceError?.message || traces?.errorMessage} />
        ) : null}
        {mergedExtensions.postPlot}
        {showCloseButton ? <CloseButton closeCallback={closeButtonCallback} /> : null}
      </div>
      {!hideSidebar ? (
        <VisSidebarWrapper id={id}>
          <StripVisSidebar config={config} extensions={extensions} columns={columns} setConfig={setConfig} />
        </VisSidebarWrapper>
      ) : null}
    </div>
  );
}
