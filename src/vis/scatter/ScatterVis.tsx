import * as React from 'react';
import d3 from 'd3';
import { merge, uniqueId } from 'lodash';
import { useEffect } from 'react';
import { EFilterOptions, IVisConfig, Scales, IScatterConfig, VisColumn } from '../interfaces';
import { InvalidCols } from '../general/InvalidCols';
import { createScatterTraces } from './utils';
import { beautifyLayout } from '../layoutUtils';
import { BrushOptionButtons } from '../sidebar/BrushOptionButtons';
import { OpacitySlider } from '../sidebar/OpacitySlider';
import { ScatterVisSidebar } from './ScatterVisSidebar';
import { PlotlyComponent, Plotly } from '../Plot';
import { useAsync } from '../../hooks';

const defaultExtensions = {
  prePlot: null,
  postPlot: null,
  preSidebar: null,
  postSidebar: null,
};

export function ScatterVis({
  config,
  optionsConfig,
  extensions,
  columns,
  shapes = ['circle', 'square', 'triangle-up', 'star'],
  filterCallback = () => null,
  selectionCallback = () => null,
  selected = {},
  setConfig,
  hideSidebar = false,
  scales,
}: {
  config: IScatterConfig;
  optionsConfig?: {
    color?: {
      enable?: boolean;
      customComponent?: React.ReactNode;
    };
    shape?: {
      enable?: boolean;
      customComponent?: React.ReactNode;
    };
    filter?: {
      enable?: boolean;
      customComponent?: React.ReactNode;
    };
  };
  extensions?: {
    prePlot?: React.ReactNode;
    postPlot?: React.ReactNode;
    preSidebar?: React.ReactNode;
    postSidebar?: React.ReactNode;
  };
  shapes?: string[];
  columns: VisColumn[];
  filterCallback?: (s: EFilterOptions) => void;
  selectionCallback?: (ids: string[]) => void;
  selected?: { [key: string]: boolean };
  setConfig: (config: IVisConfig) => void;
  scales: Scales;
  hideSidebar?: boolean;
}) {
  const id = React.useMemo(() => uniqueId('ScatterVis'), []);

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
  }, [id, hideSidebar]);

  const mergedExtensions = React.useMemo(() => {
    return merge({}, defaultExtensions, extensions);
  }, [extensions]);

  const { value: traces, status: traceStatus, error: traceError } = useAsync(createScatterTraces, [columns, selected, config, scales, shapes]);

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
      dragmode: config.dragMode,
    };

    return beautifyLayout(traces, innerLayout);
  }, [traces, config.dragMode]);

  console.log(layout);

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
            onSelected={(sel) => {
              selectionCallback(sel ? sel.points.map((d) => (d as any).id) : []);
            }}
            // plotly redraws everything on updates, so you need to reappend title and
            // change opacity on update, instead of just in a use effect
            onInitialized={() => {
              d3.selectAll('g .traces').style('opacity', config.alphaSliderVal);
              d3.selectAll('.scatterpts').style('opacity', config.alphaSliderVal);
            }}
            onUpdate={() => {
              d3.selectAll('g .traces').style('opacity', config.alphaSliderVal);
              d3.selectAll('.scatterpts').style('opacity', config.alphaSliderVal);

              for (const p of traces.plots) {
                d3.select(`g .${p.data.xaxis}title`).style('pointer-events', 'all').append('title').text(p.xLabel);

                d3.select(`g .${p.data.yaxis}title`).style('pointer-events', 'all').append('title').text(p.yLabel);
              }
            }}
          />
        ) : traceStatus !== 'pending' ? (
          <InvalidCols headerMessage={traces?.errorMessageHeader} bodyMessage={traceError?.message || traces?.errorMessage} />
        ) : null}
        <div className="position-absolute d-flex justify-content-center align-items-center top-0 start-50 translate-middle-x">
          <BrushOptionButtons callback={(dragMode: EScatterSelectSettings) => setConfig({ ...config, dragMode })} dragMode={config.dragMode} />
          <OpacitySlider callback={(e) => setConfig({ ...config, alphaSliderVal: e })} currentValue={config.alphaSliderVal} />
        </div>
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
            <ScatterVisSidebar
              config={config}
              optionsConfig={optionsConfig}
              extensions={extensions}
              columns={columns}
              filterCallback={filterCallback}
              setConfig={setConfig}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
