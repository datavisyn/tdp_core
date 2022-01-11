import * as React from 'react';
import {VisCategoricalColumn, ColumnInfo, ESupportedPlotlyVis, VisNumericalColumn, PlotlyInfo, Scales, VisColumn} from '../interfaces';
import {useEffect, useMemo} from 'react';
import {IVisConfig} from '../interfaces';
import {VisTypeSelect} from '../sidebar/VisTypeSelect';
import {NumericalColumnSelect} from '../sidebar/NumericalColumnSelect';
import Plot from 'react-plotly.js';
import {InvalidCols} from '../InvalidCols';
import {CategoricalColumnSelect} from '../sidebar/CategoricalColumnSelect';
import {merge, uniqueId} from 'lodash';
import {createPCPTraces, IPCPConfig} from './utils';
import {WarningMessage} from '../sidebar/WarningMessage';
import {useAsync} from '../..';
import Plotly from 'plotly.js';

interface PCPVisProps {
    config: IPCPConfig;
    optionsConfig?: {};
    extensions?: {
        prePlot?: React.ReactNode;
        postPlot?: React.ReactNode;
        preSidebar?: React.ReactNode;
        postSidebar?: React.ReactNode;
    };
    columns: VisColumn[];
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

    const {value: traces, status: traceStatus, error: traceError} = useAsync(createPCPTraces, [columns, config]);

    const id = useMemo(() => uniqueId('PCPVis'), []);

    useEffect(() => {
        const menu = document.getElementById(`generalVisBurgerMenu${id}`);

        menu.addEventListener('hidden.bs.collapse', () => {
            Plotly.Plots.resize(document.getElementById(`plotlyDiv${uniqueId}`));
          });

        menu.addEventListener('shown.bs.collapse', () => {
            Plotly.Plots.resize(document.getElementById(`plotlyDiv${uniqueId}`));
          });
    }, []);

    //@ts-ignore
    const layout = useMemo<Partial<Plotly.Layout> | null>(() => {
        return traces ? {
            showlegend: true,
            legend: {
                itemclick: false,
                itemdoubleclick: false
            },
            autosize: true,
            grid: {rows: traces.rows, columns: traces.cols, xgap: .3, pattern: 'independent'},
            shapes: [],
            violingap: 0,
        } : null;
    }, [traces]);

    return (
        <div className="d-flex flex-row w-100 h-100" style={{minHeight: '0px'}}>
            <div className={`position-relative d-flex justify-content-center align-items-center flex-grow-1 ${traceStatus === 'pending' ? 'tdp-busy-partial-overlay' : ''}`}>
                {mergedExtensions.prePlot}
                {traceStatus === 'success' && traces?.plots.length > 0 ?
                    <Plot
                        divId={`plotlyDiv${id}`}
                        data={[...traces.plots.map((p) => p.data), ...traces.legendPlots.map((p) => p.data)]}
                        layout={layout}
                        config={{responsive: true, displayModeBar: false}}
                        useResizeHandler={true}
                        style={{width: '100%', height: '100%'}}
                        //plotly redraws everything on updates, so you need to reappend title and
                        // change opacity on update, instead of just in a use effect
                    /> :
                    traceStatus !== 'pending' ? <InvalidCols message={traceError?.message || traces?.errorMessage} /> : null}
            {mergedExtensions.postPlot}

            </div>
            <div className="position-relative h-100 flex-shrink-1 bg-light overflow-auto">
                <button className="btn btn-primary-outline" type="button" data-bs-toggle="collapse" data-bs-target={`#generalVisBurgerMenu${id}`} aria-expanded="true" aria-controls="generalVisBurgerMenu">
                    <i className="fas fa-bars"/>
                </button>
                <div className="collapse show collapse-horizontal" id={`generalVisBurgerMenu${id}`}>
                    <div className="container pb-3" style={{width: '20rem'}}>
                        <WarningMessage/>
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
