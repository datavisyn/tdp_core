import * as React from 'react';
import d3 from 'd3';
import { uniqueId } from 'lodash';
import { useEffect } from 'react';
import { IViolinConfig, ICommonVisProps } from '../interfaces';
import { PlotlyComponent, Plotly } from '../Plot';
import { InvalidCols } from '../general';
import { beautifyLayout } from '../general/layoutUtils';
import { createViolinTraces } from './utils';
import { useAsync } from '../../hooks';
import { CloseButton } from '../sidebar/CloseButton';
import { useVisResize } from '../useVisResize';

export function ViolinVis({ config, columns, scales, showCloseButton = false, closeButtonCallback = () => null }: ICommonVisProps<IViolinConfig>) {
  const { value: traces, status: traceStatus, error: traceError } = useAsync(createViolinTraces, [columns, config, scales]);

  const id = React.useMemo(() => uniqueId('ViolinVis'), []);

  const plotlyDivRef = React.useRef(null);

  useVisResize(id, plotlyDivRef);

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
      font: {
        family: 'Roboto, sans-serif',
      },
      autosize: true,
      grid: { rows: traces.rows, columns: traces.cols, xgap: 0.3, pattern: 'independent' },
      shapes: [],
      violingap: 0,
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
          <InvalidCols headerMessage={traces?.errorMessageHeader} bodyMessage={traceError?.message || traces?.errorMessage} />
        ) : null}
        {showCloseButton ? <CloseButton closeCallback={closeButtonCallback} /> : null}
      </div>
    </div>
  );
}
