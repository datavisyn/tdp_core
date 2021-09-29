import * as React from 'react';
import {CategoricalColumn, ColumnInfo, ESupportedPlotlyVis, NumericalColumn, PlotlyInfo, Scales} from '../interfaces';
import {useMemo} from 'react';
import {IVisConfig} from '../interfaces';
import {VisTypeSelect} from '../sidebar/VisTypeSelect';
import {NumericalColumnSelect} from '../sidebar/NumericalColumnSelect';
import Plot from 'react-plotly.js';
import {InvalidCols} from '../InvalidCols';
import d3 from 'd3';
import {CategoricalColumnSelect} from '../sidebar/CategoricalColumnSelect';
import {merge} from 'lodash';
import {createPCPTraces, IPCPConfig} from './utils';

interface PCPVisProps {
    config: IPCPConfig;
    optionsConfig?: {};
    extensions?: {
        prePlot?: React.ReactNode;
        postPlot?: React.ReactNode;
        preSidebar?: React.ReactNode;
        postSidebar?: React.ReactNode;
    };
    columns: (NumericalColumn | CategoricalColumn) [];
    setConfig: (config: IVisConfig) => void;
}

const defaultConfig = {};

const defaultExtensions = {
    prePlot: null,
    postPlot: null,
    preSidebar: null,
    postSidebar: null
};

export function PCPVis({
    config,
    optionsConfig,
    extensions,
    columns,
    setConfig,
}: PCPVisProps) {

    const mergedOptionsConfig = useMemo(() => {
        return merge({}, defaultConfig, optionsConfig);
    }, []);

    const mergedExtensions = useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, []);

    const traces: PlotlyInfo = useMemo(() => {
        return createPCPTraces(columns, config);
    }, [columns, config]);

    const layout = useMemo(() => {
        return {
            showlegend: true,
            legend: {
                itemclick: false,
                itemdoubleclick: false
            },
            autosize: true,
            grid: {rows: traces.rows, columns: traces.cols, xgap: .3, pattern: 'independent'},
            shapes: [],
            violingap: 0,
        };
    }, [traces]);

    return (
        <div className="d-flex flex-row w-100 h-100">
            <div className="position-relative d-flex justify-content-center align-items-center flex-grow-1">
                {mergedExtensions.prePlot}

                {traces.plots.length > 0 ?
                    (<Plot
                        divId={'plotlyDiv'}
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
            <div className="position-relative h-100 flex-shrink-1 bg-light">
                <button className="btn btn-primary-outline" type="button" data-bs-toggle="collapse" data-bs-target="#generalVisBurgerMenu" aria-expanded="true" aria-controls="generalVisBurgerMenu">
                    <i className="fas fa-bars"/>
                </button>
                <div className="collapse show collapse-horizontal" id="generalVisBurgerMenu">
                    <div className="container" style={{width: '20rem'}}>
                        <VisTypeSelect
                            callback={(type: ESupportedPlotlyVis) => setConfig({...config as any, type})}
                            currentSelected={config.type}
                        />
                        <hr/>
                        <NumericalColumnSelect
                            callback={(numColumnsSelected: ColumnInfo[]) => setConfig({...config, numColumnsSelected})}
                            columns={columns}
                            currentSelected={config.numColumnsSelected || []}
                        />
                        <CategoricalColumnSelect
                            callback={(catColumnsSelected: ColumnInfo[]) => setConfig({...config, catColumnsSelected})}
                            columns={columns}
                            currentSelected={config.catColumnsSelected || []}
                        />
                        <hr/>
                        {mergedExtensions.preSidebar}
                        {mergedExtensions.postSidebar}
                    </div>
                </div>
            </div>
        </div>);
}
