import * as React from 'react';
import {CategoricalColumn, ColumnInfo, ESupportedPlotlyVis, NumericalColumn, PlotlyInfo, Scales} from '../interfaces';
import {useEffect, useMemo} from 'react';
import {IVisConfig} from '../interfaces';
import {VisTypeSelect} from '../sidebar/VisTypeSelect';
import {NumericalColumnSelect} from '../sidebar/NumericalColumnSelect';

import Plot from 'react-plotly.js';
import {InvalidCols} from '../InvalidCols';
import d3 from 'd3';
import {beautifyLayout} from '../layoutUtils';
import {merge} from 'lodash';
import {createBarTraces, EBarDirection, EBarDisplayType, EBarGroupingType, IBarConfig} from './utils';
import {GroupSelect} from '../sidebar/GroupSelect';
import {MultiplesSelect} from '../sidebar/MultiplesSelect';
import {BarDirectionButtons} from '../sidebar/BarDirectionButtons';
import {BarGroupTypeButtons} from '../sidebar/BarGroupTypeButtons';
import {BarDisplayButtons} from '../sidebar/BarDisplayTypeButtons';
import {CategoricalColumnSelect} from '../sidebar/CategoricalColumnSelect';
import {WarningMessage} from '../sidebar/WarningMessage';
import Plotly from 'plotly.js';
import {BarVisSidebar} from './BarVisSidebar';

interface BarVisProps {
    config: IBarConfig;
    optionsConfig?: {
        group?: {
            enable?: boolean;
            customComponent?: React.ReactNode;
        },
        multiples?: {
            enable?: boolean;
            customComponent?: React.ReactNode;
        },
        direction?: {
            enable?: boolean;
            customComponent?: React.ReactNode;
        },
        groupingType?: {
            enable?: boolean;
            customComponent?: React.ReactNode;
        },
        display?: {
            enable?: boolean;
            customComponent?: React.ReactNode;
        }
    };
    extensions?: {
        prePlot?: React.ReactNode;
        postPlot?: React.ReactNode;
        preSidebar?: React.ReactNode;
        postSidebar?: React.ReactNode;
    };
    columns: (NumericalColumn | CategoricalColumn) [];
    setConfig: (config: IVisConfig) => void;
    scales: Scales;
    hideSidebar?: boolean;
}

const defaultConfig = {
    group: {
        enable: true,
        customComponent: null,
    },
    multiples: {
        enable: true,
        customComponent: null,
    },
    direction: {
        enable: true,
        customComponent: null,
    },
    groupType: {
        enable: true,
        customComponent: null,
    },
    display: {
        enable: true,
        customComponent: null,
    }
};

const defaultExtensions = {
    prePlot: null,
    postPlot: null,
    preSidebar: null,
    postSidebar: null
};

export function BarVis({
    config,
    optionsConfig,
    extensions,
    columns,
    setConfig,
    scales,
    hideSidebar = false,
}: BarVisProps) {
    const mergedOptionsConfig = useMemo(() => {
        return merge({}, defaultConfig, optionsConfig);
    }, []);



    const mergedExtensions = useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, []);

    const traces: PlotlyInfo = useMemo(() => {
        return createBarTraces(columns, config, scales);
    }, [columns, config, scales]);

    const uniqueId = useMemo(() => {
        return Math.random().toString(36).substr(2, 5);
    }, []);

    useEffect(() => {
        const menu = document.getElementById(`generalVisBurgerMenu${uniqueId}`);

        menu.addEventListener('hidden.bs.collapse', () => {
            Plotly.Plots.resize(document.getElementById(`plotlyDiv${uniqueId}`));
          });

        menu.addEventListener('shown.bs.collapse', () => {
            Plotly.Plots.resize(document.getElementById(`plotlyDiv${uniqueId}`));
          });
    }, []);

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
            barmode: config.groupType === EBarGroupingType.STACK ? 'stack' : 'group'
        };

        return beautifyLayout(traces, layout);
    }, [traces, config.groupType]);

    return (
        <div className="d-flex flex-row w-100 h-100" style={{minHeight: '0px'}}>
            <div className="position-relative d-flex justify-content-center align-items-center flex-grow-1">
                {mergedExtensions.prePlot}
                {traces.plots.length > 0 ?
                    (<Plot
                        divId={`plotlyDiv${uniqueId}`}
                        data={[...traces.plots.map((p) => p.data), ...traces.legendPlots.map((p) => p.data)]}
                        layout={layout as any}
                        config={{responsive: true, displayModeBar: false}}
                        useResizeHandler={true}
                        style={{width: '100%', height: '100%'}}
                        //plotly redraws everything on updates, so you need to reappend title and
                        // change opacity on update, instead of just in a use effect
                        onUpdate={() => {
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
                {mergedExtensions.postPlot}

            </div>
            {!hideSidebar ?
            <div className="position-relative h-100 flex-shrink-1 bg-light overflow-auto mt-2">
                <button className="btn btn-primary-outline" type="button" data-bs-toggle="collapse" data-bs-target={`#generalVisBurgerMenu${uniqueId}`} aria-expanded="true" aria-controls="generalVisBurgerMenu">
                    <i className="fas fa-bars"/>
                </button>
                <div className="collapse show collapse-horizontal" id={`generalVisBurgerMenu${uniqueId}`}>
                    <BarVisSidebar config={config} optionsConfig={optionsConfig} extensions={extensions} columns={columns} setConfig={setConfig}/>
                </div>
            </div> : null}
        </div>);
}

