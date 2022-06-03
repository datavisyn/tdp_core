import * as React from 'react';
import d3 from 'd3';
import { uniqueId } from 'lodash';
import { IBarConfig, EBarGroupingType, ICommonVisProps, ESupportedPlotlyVis } from '../interfaces';
import { PlotlyComponent, Plotly } from '../Plot';
import { InvalidCols } from '../general';
import { beautifyLayout } from '../general/layoutUtils';
import { useAsync } from '../../hooks';
import { barMergeDefaultConfig, createBarTraces } from './utils';
import { CloseButton } from '../sidebar/CloseButton';
import { useVisResize } from '../useVisResize';
import { CreateVisualization } from '../AllVisualizations';

export function BarVis({ config, columns, scales, showCloseButton = false, closeButtonCallback = () => null }: ICommonVisProps<IBarConfig>) {
  const { value: traces, status: traceStatus, error: traceError } = useAsync(createBarTraces, [columns, config, scales]);

  const id = React.useMemo(() => uniqueId('BarVis'), []);

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
      barmode: config.groupType === EBarGroupingType.STACK ? 'stack' : 'group',
    };

    return beautifyLayout(traces, innerLayout);
  }, [traces, config.groupType]);

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

CreateVisualization(BarVis, barMergeDefaultConfig, ESupportedPlotlyVis.BAR, 'bar');
