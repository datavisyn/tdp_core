import * as React from 'react';
import {CategoricalColumn, ColumnInfo, EFilterOptions, ESupportedPlotlyVis, NumericalColumn, PlotlyInfo, Scales} from '../../types/generalTypes';
import {useEffect, useMemo} from 'react';
import {IVisConfig} from '../../types/generalTypes';
import {VisTypeSelect} from '../sidebar/VisTypeSelect';
import {NumericalColumnSelect} from '../sidebar/NumericalColumnSelect';
import {ColorSelect} from '../sidebar/ColorSelect';
import {ShapeSelect} from '../sidebar/ShapeSelect';
import {FilterButtons} from '../sidebar/FilterButtons';
import Plot from 'react-plotly.js';
import {InvalidCols} from '../InvalidCols';
import d3 from 'd3';
import {createScatterTraces, ENumericalColorScaleType, IScatterConfig, scatterInit} from '../../plotUtils/scatter';
import {beautifyLayout} from '../../utils/layoutUtils';
import {merge} from 'lodash';

interface ScatterVisProps {
    config: IScatterConfig;
    optionsConfig?: {
        color?: {
            enable?: boolean;
            customComponent?: React.ReactNode;
        },
        shape?: {
            enable?: boolean;
            customComponent?: React.ReactNode;
        },
        filter?: {
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
    shapes: string[] | null;
    columns: (NumericalColumn | CategoricalColumn) [];
    filterCallback: (s: EFilterOptions) => void;
    selectionCallback: (s: number[]) => void;
    selected: {[key: number]: boolean};
    setConfig: (config: IVisConfig) => void;
    scales: Scales;
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
    }
};

const defaultExtensions = {
    prePlot: null,
    postPlot: null,
    preSidebar: null,
    postSidebar: null
};

export function ScatterVis({
    config,
    optionsConfig,
    extensions,
    columns,
    shapes,
    filterCallback,
    selectionCallback,
    selected,
    setConfig,
    scales
}: ScatterVisProps) {

    useEffect(() => {
        scatterInit(columns, config, setConfig);
    }, []);

    const mergedOptionsConfig = useMemo(() => {
        return merge(defaultConfig, optionsConfig);
    }, []);

    const mergedExtensions = useMemo(() => {
        return merge(defaultExtensions, extensions);
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
                        onSelected={(d) => {
                            console.log(d);
                            d ? selectionCallback(d.points.map((d) => +(d as any).id)) : selectionCallback([]);
                        }}
                        //plotly redraws everything on updates, so you need to reappend title and
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
                        <hr/>
                        {mergedExtensions.preSidebar}

                        {mergedOptionsConfig.color.enable ? mergedOptionsConfig.color.customComponent
                        || <ColorSelect
                            callback={(color: ColumnInfo) => setConfig({...config, color})}
                            numTypeCallback={(numColorScaleType: ENumericalColorScaleType) => setConfig({...config, numColorScaleType})}
                            currentNumType={config.numColorScaleType}
                            columns={columns}
                            currentSelected={config.color}
                        /> : null }
                        {mergedOptionsConfig.shape.enable ? mergedOptionsConfig.shape.customComponent
                        || <ShapeSelect
                            callback={(shape: ColumnInfo) => setConfig({...config, shape})}
                            columns={columns}
                            currentSelected={config.shape}
                        /> : null }
                        <hr/>
                        {mergedOptionsConfig.filter.enable ? mergedOptionsConfig.filter.customComponent
                        || <FilterButtons
                            callback={filterCallback}
                        /> : null }

                        {mergedExtensions.postSidebar}
                    </div>
                </div>
            </div>
        </div>);
}

