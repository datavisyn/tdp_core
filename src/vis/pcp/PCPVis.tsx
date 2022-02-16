/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';
import { useEffect, useMemo } from 'react';
import Plot from 'react-plotly.js';
import d3 from 'd3';
import { merge } from 'lodash';
import Plotly from 'plotly.js';
import { ScatterVisSidebar } from '../scatter/ScatterVisSidebar';
import { PCPVisSidebar } from './PCPVisSidebar';
import { CategoricalColumn, InvalidCols, IPCPConfig, IVisConfig, NumericalColumn, PlotlyInfo } from '..';
import { createPCPTraces } from './utils';

interface PCPVisProps {
  config: IPCPConfig;
  optionsConfig?: {};
  extensions?: {
    prePlot?: React.ReactNode;
    postPlot?: React.ReactNode;
    preSidebar?: React.ReactNode;
    postSidebar?: React.ReactNode;
  };
  columns: (NumericalColumn | CategoricalColumn)[];
  setConfig: (config: IVisConfig) => void;
  hideSidebar?: boolean;
}

const defaultConfig = {};

const defaultExtensions = {
  prePlot: null,
  postPlot: null,
  preSidebar: null,
  postSidebar: null,
};

export function PCPVis({ config, optionsConfig, extensions, columns, setConfig, hideSidebar = false }: PCPVisProps) {
  const mergedOptionsConfig = useMemo(() => {
    return merge({}, defaultConfig, optionsConfig);
  }, []);

  const mergedExtensions = useMemo(() => {
    return merge({}, defaultExtensions, extensions);
  }, []);

  const traces: PlotlyInfo = useMemo(() => {
    return createPCPTraces(columns, config);
  }, [columns, config]);

  const uniqueId = useMemo(() => {
    return Math.random().toString(36).substr(2, 5);
  }, []);

  useEffect(() => {
    if (hideSidebar) {
      return;
    }
    const menu = document.getElementById(`generalVisBurgerMenu${uniqueId}`);

    menu.addEventListener('hidden.bs.collapse', () => {
      Plotly.Plots.resize(document.getElementById(`plotlyDiv${uniqueId}`));
    });

    menu.addEventListener('shown.bs.collapse', () => {
      Plotly.Plots.resize(document.getElementById(`plotlyDiv${uniqueId}`));
    });
  }, [hideSidebar]);

  const layout = useMemo(() => {
    return {
      showlegend: true,
      legend: {
        itemclick: false,
        itemdoubleclick: false,
      },
      autosize: true,
      grid: { rows: traces.rows, columns: traces.cols, xgap: 0.3, pattern: 'independent' },
      shapes: [],
      violingap: 0,
    };
  }, [traces]);

  return (
    <div className="d-flex flex-row w-100 h-100" style={{ minHeight: '0px' }}>
      <div className="position-relative d-flex justify-content-center align-items-center flex-grow-1">
        {mergedExtensions.prePlot}

        {traces.plots.length > 0 ? (
          <Plot
            divId={`plotlyDiv${uniqueId}`}
            data={[...traces.plots.map((p) => p.data), ...traces.legendPlots.map((p) => p.data)]}
            layout={layout as any}
            config={{ responsive: true, displayModeBar: false }}
            useResizeHandler
            style={{ width: '100%', height: '100%' }}
            // plotly redraws everything on updates, so you need to reappend title and
            // change opacity on update, instead of just in a use effect
            onUpdate={() => {
              for (const p of traces.plots) {
                d3.select(`g .${(p.data as any).xaxis}title`)
                  .style('pointer-events', 'all')
                  .append('title')
                  .text(p.xLabel);

                d3.select(`g .${(p.data as any).yaxis}title`)
                  .style('pointer-events', 'all')
                  .append('title')
                  .text(p.yLabel);
              }
            }}
          />
        ) : (
          <InvalidCols message={traces.errorMessage} />
        )}
        {mergedExtensions.postPlot}
      </div>
      {!hideSidebar ? (
        <div className="position-relative h-100 flex-shrink-1 bg-light overflow-auto mt-2">
          <button
            className="btn btn-primary-outline"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target={`#generalVisBurgerMenu${uniqueId}`}
            aria-expanded="true"
            aria-controls="generalVisBurgerMenu"
          >
            <i className="fas fa-bars" />
          </button>
          <div className="collapse show collapse-horizontal" id={`generalVisBurgerMenu${uniqueId}`}>
            <PCPVisSidebar config={config} optionsConfig={optionsConfig} extensions={extensions} columns={columns} setConfig={setConfig} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
