/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';
import {useEffect, useMemo} from 'react';
import Plot from 'react-plotly.js';
import d3 from 'd3';
import { merge } from 'lodash';
import Plotly from 'plotly.js';
import {
  CategoricalColumn,
  EFilterOptions,
  IVisConfig,
  NumericalColumn,
  PlotlyInfo,
  Scales,
  IScatterConfig,
} from '../interfaces';
import { InvalidCols } from '../InvalidCols';
import { createScatterTraces } from './utils';
import { beautifyLayout } from '../layoutUtils';
import { BrushOptionButtons } from '../sidebar/BrushOptionButtons';
import { OpacitySlider } from '../sidebar/OpacitySlider';
import {ScatterVisSidebar} from './ScatterVisSidebar';

interface ScatterVisProps {
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
  columns: (NumericalColumn | CategoricalColumn) [];
  filterCallback?: (s: EFilterOptions) => void;
  selectionCallback?: (s: string[]) => void;
  selected?: {[key: number]: boolean};
  setConfig: (config: IVisConfig) => void;
  scales: Scales;
  hideSidebar?: boolean;
}

const defaultConfig = {
  color: {
    enable: true,
    customComponent: null,
  },
  shape: {
    enable: true,
    customComponent: null,
  },
  filter: {
    enable: true,
    customComponent: null,
  },
};

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
    scales
}: ScatterVisProps) {
    const uniqueId = useMemo(() => {
        return Math.random().toString(36).substr(2, 5);
    }, []);

    useEffect(() => {
        if(hideSidebar) {
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

    const mergedOptionsConfig = useMemo(() => {
        return merge({}, defaultConfig, optionsConfig);
    }, []);

    const mergedExtensions = useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, []);

    const traces: PlotlyInfo = useMemo(() => {
        return createScatterTraces(columns, selected, config, scales, shapes);
    }, [columns, selected, config, scales, shapes]);

    const layout = useMemo(() => {
        const layout = {
            showlegend: true,
            legend: {
                itemclick: false,
                itemdoubleclick: false
            },
            autosize: true,
            grid: {rows: traces.rows, columns: traces.cols, xgap: .3, pattern: 'independent'},
            shapes: [],
            violingap: 0,
            dragmode: config.isRectBrush ? 'select' : 'lasso',
        };

        return beautifyLayout(traces, layout);
    }, [traces, config.isRectBrush]);

    return (
        <div className="d-flex flex-row w-100 h-100" style={{minHeight: '0px'}}>
            <div className="position-relative d-flex justify-content-center align-items-center flex-grow-1 mt-2">
                {mergedExtensions.prePlot}
                {traces.plots.length > 0 ?
                    (<Plot
                        divId={`plotlyDiv${uniqueId}`}
                        data={[...traces.plots.map((p) => p.data), ...traces.legendPlots.map((p) => p.data)]}
                        layout={layout as any}
                        config={{responsive: true, displayModeBar: false}}
                        useResizeHandler={true}
                        style={{width: '100%', height: '100%'}}
                        onSelected={(d) => {
                            console.log(d);
                            d ? selectionCallback(d.points.map((d) => (d as any).id)) : selectionCallback([]);
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

                            for(const p of traces.plots) {
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
                    />) : (<InvalidCols
                        message={traces.errorMessage} />)
                }
                <div className="position-absolute d-flex justify-content-center align-items-center top-0 start-50 translate-middle-x">
                    <BrushOptionButtons
                        callback={(e: boolean) => setConfig({...config, isRectBrush: e})}
                        isRectBrush={config.isRectBrush}
                    />
                    <OpacitySlider
                        callback={(e) => setConfig({...config, alphaSliderVal: e})}
                        currentValue={config.alphaSliderVal}
                    />
                </div>
                {mergedExtensions.postPlot}
            </div>
            {!hideSidebar ?
            <div className="position-relative h-100 flex-shrink-1 bg-light overflow-auto mt-2">
                <button className="btn btn-primary-outline" type="button" data-bs-toggle="collapse" data-bs-target={`#generalVisBurgerMenu${uniqueId}`} aria-expanded="true" aria-controls="generalVisBurgerMenu">
                    <i className="fas fa-bars"/>
                </button>
                <div className="collapse show collapse-horizontal" id={`generalVisBurgerMenu${uniqueId}`}>
                    <ScatterVisSidebar config={config} optionsConfig={optionsConfig} extensions={extensions} columns={columns} filterCallback={filterCallback} setConfig={setConfig}/>
                </div>
            </div> : null}
        </div>);
}
