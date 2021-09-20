import d3 from 'd3';
import * as React from 'react';
import {useEffect, useMemo, useState} from 'react';
import Plot, {Figure} from 'react-plotly.js';
import {GeneralPlot} from '../types/generalPlotInterface';
import {InvalidCols} from './InvalidCols';
import {GeneralSidePanel} from './GeneralSidePanel';
import {EBarDirection, EBarDisplayType, EBarGroupingType, EViolinOverlay, PlotlyBar} from '../plots/bar';
import {PlotlyPCP} from '../plots/pcp';
import {ENumericalColorScaleType, PlotlyScatter} from '../plots/scatter';
import {PlotlyStrip} from '../plots/strip';
import {PlotlyViolin} from '../plots/violin';
import {AllDropdownOptions, CategoricalColumn, PlotlyInfo, GeneralHomeProps, NumericalColumn, EColumnTypes, ESupportedPlotlyVis, EGeneralFormType, ColumnInfo} from '../types/generalTypes';
import {beautifyLayout} from '../utils/layoutUtils';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPaintBrush} from '@fortawesome/free-solid-svg-icons';
import {faSquare} from '@fortawesome/free-regular-svg-icons';
import {config} from '@fortawesome/fontawesome-svg-core';


export function GeneralHome(props: GeneralHomeProps) {
    const [currentVis, setCurrentVis] = useState<ESupportedPlotlyVis>(ESupportedPlotlyVis.SCATTER);
    const [selectedCatCols, setSelectedCatCols] = useState<ColumnInfo[]>(
        props.columns.filter((c) => c.selectedForMultiples === true && c.type === EColumnTypes.CATEGORICAL).map((c) => c.info)
    );
    const [selectedNumCols, setSelectedNumCols] = useState<ColumnInfo[]>(
        props.columns.filter((c) => c.selectedForMultiples === true && c.type === EColumnTypes.NUMERICAL).map((c) => c.info)
    );

    const [isRectBrush, setIsRectBrush] = useState<boolean>(true);
    const [alphaValue, setAlphaValue] = useState<number>(1);


    const [bubbleSize, setBubbleSize] = useState<NumericalColumn | null>(null);
    const [colorMapping, setColorMapping] = useState<CategoricalColumn | NumericalColumn | null>(null);
    const [opacity, setOpacity] = useState<NumericalColumn | null>(null);
    const [shape, setShape] = useState<CategoricalColumn | null>(null);
    const [barGroup, setBarGroup] = useState<CategoricalColumn | null>(null);
    const [barMultiples, setBarMultiples] = useState<CategoricalColumn | null>(null);
    const [barDisplayType, setBarDisplayType] = useState<EBarDisplayType>(EBarDisplayType.DEFAULT);
    const [barGroupType, setBarGroupType] = useState<EBarGroupingType>(EBarGroupingType.STACK);
    const [barDirection, setBarDirection] = useState<EBarDirection>(EBarDirection.VERTICAL);
    const [violinOverlay, setViolinOverlay] = useState<EViolinOverlay>(EViolinOverlay.NONE);
    const [numericalColorScaleType, setNumericalColorScaleType] = useState<ENumericalColorScaleType>(ENumericalColorScaleType.SEQUENTIAL);

    const updateBubbleSize = (newCol: ColumnInfo) => setBubbleSize(props.columns.filter((c) => newCol && c.info.id === newCol.id && c.type === EColumnTypes.NUMERICAL)[0] as NumericalColumn);
    const updateOpacity = (newCol: ColumnInfo) => setOpacity(props.columns.filter((c) => newCol && c.info.id === newCol.id && c.type === EColumnTypes.NUMERICAL)[0] as NumericalColumn);
    const updateColor = (newCol: ColumnInfo) => setColorMapping(props.columns.filter((c) => newCol && c.info.id === newCol.id)[0]);
    const updateShape = (newCol: ColumnInfo) => setShape(props.columns.filter((c) => newCol && c.info.id === newCol.id && c.type === EColumnTypes.CATEGORICAL)[0] as CategoricalColumn);
    const updateBarGroup = (newCol: ColumnInfo) => setBarGroup(props.columns.filter((c) => newCol && c.info.id === newCol.id && c.type === EColumnTypes.CATEGORICAL)[0] as CategoricalColumn);
    const updateBarMultiples = (newCol: ColumnInfo) => setBarMultiples(props.columns.filter((c) => newCol && c.info.id === newCol.id && c.type === EColumnTypes.CATEGORICAL)[0] as CategoricalColumn);

    const updateCurrentVis = (s: ESupportedPlotlyVis) => setCurrentVis(s);
    const updateSelectedCatCols = (s: ColumnInfo[]) => setSelectedCatCols(s);
    const updateSelectedNumCols = (s: ColumnInfo[]) => setSelectedNumCols(s);

    const updateBarDisplayType = (s: EBarDisplayType) => setBarDisplayType(s);
    const updateBarGroupType = (s: EBarGroupingType) => setBarGroupType(s);
    const updateBarDirection = (s: EBarDirection) => setBarDirection(s);
    const updateViolinOverlay = (s: EViolinOverlay) => setViolinOverlay(s);
    const updateAlphaValue = (n: number) => setAlphaValue(n);

    const updateNumericalColorScaleType = (s: ENumericalColorScaleType) => setNumericalColorScaleType(s);


    const shapeScale = useMemo(() => {
        return shape ?
            d3.scale.ordinal<string>().domain([...new Set(shape.vals.map((v) => v.val))]).range(['circle', 'square', 'triangle-up', 'star'])
            : null;
    }, [shape]);

    const bubbleScale = useMemo(() => {
        return bubbleSize ?
            d3.scale.linear().domain([0, d3.max(bubbleSize.vals.map((v) => v.val))]).range([0, 10])
            : null;
    }, [bubbleSize]);

    const opacityScale = useMemo(() => {
        return opacity ?
            d3.scale.linear().domain([0, d3.max(opacity.vals.map((v) => v.val))]).range([0, 1])
            : null;
    }, [opacity]);

    const colorScale = useMemo(() => {
        return d3.scale.ordinal().range(['#337ab7', '#ec6836', '#75c4c2', '#e9d36c', '#24b466', '#e891ae', '#db933c', '#b08aa6', '#8a6044', '#7b7b7b']);
    }, [colorMapping]);

    const sequentialColorScale = useMemo(() => {
        return colorMapping ?
            d3.scale.linear<string, number>()
                .domain([d3.min(colorMapping.vals.map((v) => v.val).filter((v) => v !== '--')),
                        d3.median(colorMapping.vals.map((v) => v.val).filter((v) => v !== '--')),
                        d3.max(colorMapping.vals.map((v) => v.val).filter((v) => v !== '--'))])
                .range(numericalColorScaleType === ENumericalColorScaleType.SEQUENTIAL ? ['#002245', '#5c84af', '#cff6ff'] : ['#003367','#f5f5f5', '#6f0000'])
            : null;
    }, [colorMapping, numericalColorScaleType]);

    const allExtraDropdowns: AllDropdownOptions = useMemo(() => {

        return {
            bubble: {
                name: 'Bubble Size',
                callback: updateBubbleSize,
                scale: bubbleScale,
                currentColumn: bubbleSize ? bubbleSize : null,
                currentSelected: bubbleSize ? bubbleSize.info : null,
                options: props.columns.filter((c) => c.type === EColumnTypes.NUMERICAL).map((c) => c.info),
                type: EGeneralFormType.DROPDOWN,
                disabled: false
            },
            opacity: {
                name: 'Opacity',
                callback: updateOpacity,
                scale: opacityScale,
                currentColumn: opacity ? opacity : null,
                currentSelected: opacity ? opacity.info : null,

                options: props.columns.filter((c) => c.type === EColumnTypes.NUMERICAL).map((c) => c.info),
                type: EGeneralFormType.DROPDOWN,
                disabled: false
            },
            color: {
                name: 'Color',
                callback: updateColor,
                scale: colorMapping && colorMapping.type === EColumnTypes.NUMERICAL ? sequentialColorScale : colorScale,
                currentColumn: colorMapping ? colorMapping : null,
                currentSelected: colorMapping ? colorMapping.info : null,
                options: props.columns.map((c) => c.info),
                type: EGeneralFormType.DROPDOWN,
                disabled: false
            },
            numericalColorScaleType: {
                name: 'Numerical Color Scale Type',
                callback: updateNumericalColorScaleType,
                scale: null,
                currentColumn: null,
                currentSelected: numericalColorScaleType,
                options: [ENumericalColorScaleType.SEQUENTIAL, ENumericalColorScaleType.DIVERGENT],
                type: EGeneralFormType.BUTTON,
                disabled: colorMapping && colorMapping.type === EColumnTypes.NUMERICAL ? false : true
            },
            alphaSlider: {
                name: 'Alpha',
                callback: updateAlphaValue,
                scale: null,
                currentColumn: null,
                currentSelected: alphaValue,
                options: null,
                type: EGeneralFormType.SLIDER,
                disabled: false
            },
            shape: {
                name: 'Shape',
                callback: updateShape,
                scale: shapeScale,
                currentColumn: shape ? shape : null,
                currentSelected: shape ? shape.info : null,

                options: props.columns.filter((c) => c.type === EColumnTypes.CATEGORICAL).map((c) => c.info),
                type: EGeneralFormType.DROPDOWN,
                disabled: false
            },
            groupBy: {
                name: 'Group',
                callback: updateBarGroup,
                scale: null,
                currentColumn: barGroup ? barGroup : null,
                currentSelected: barGroup ? barGroup.info : null,

                options: props.columns.filter((c) => c.type === EColumnTypes.CATEGORICAL).map((c) => c.info),
                type: EGeneralFormType.DROPDOWN,
                disabled: false
            },
            barMultiplesBy: {
                name: 'Small Multiples',
                callback: updateBarMultiples,
                scale: null,
                currentColumn: barMultiples ? barMultiples : null,
                currentSelected: barMultiples ? barMultiples.info : null,

                options: props.columns.filter((c) => c.type === EColumnTypes.CATEGORICAL).map((c) => c.info),
                type: EGeneralFormType.DROPDOWN,
                disabled: false
            },
            filter: {
                name: 'Filter',
                callback: props.filterCallback,
                scale: null,
                currentColumn: null,
                currentSelected: '',
                options: ['Filter In', 'Filter Out', 'Clear'],
                type: EGeneralFormType.BUTTON,
                disabled: false
            },
            barDirection: {
                name: 'Bar Direction',
                callback: updateBarDirection,
                scale: null,
                currentColumn: null,
                currentSelected: barDirection,
                options: [EBarDirection.VERTICAL, EBarDirection.HORIZONTAL],
                type: EGeneralFormType.BUTTON,
                disabled: false
            },
            barGroupType: {
                name: 'Bar Group By',
                callback: updateBarGroupType,
                scale: null,
                currentColumn: null,
                currentSelected: barGroupType,

                options: [EBarGroupingType.STACK, EBarGroupingType.GROUP],
                type: EGeneralFormType.BUTTON,
                disabled: barGroup === null
            },
            barNormalized: {
                name: 'Bar Normalized',
                callback: updateBarDisplayType,
                scale: null,
                currentColumn: null,
                currentSelected: barDisplayType,
                options: [EBarDisplayType.DEFAULT, EBarDisplayType.NORMALIZED],
                type: EGeneralFormType.BUTTON,
                disabled: barGroup === null
            },
            violinOverlay: {
                name: 'Show Strip Plot',
                callback: updateViolinOverlay,
                scale: null,
                currentColumn: null,
                currentSelected: violinOverlay,
                options: [EViolinOverlay.NONE, EViolinOverlay.BOX, EViolinOverlay.STRIP],
                type: EGeneralFormType.BUTTON,
                disabled: false
            }
        };
    }, [props.columns, selectedCatCols, selectedNumCols, alphaValue, bubbleSize, colorMapping, opacity, shape, barDirection, barGroup, barGroupType, barMultiples, barDisplayType, violinOverlay, numericalColorScaleType]);

    const currPlot: GeneralPlot = useMemo(() => {
        switch (currentVis) {
            case ESupportedPlotlyVis.SCATTER: {
                return new PlotlyScatter();
            }
            case ESupportedPlotlyVis.VIOLIN: {
                return new PlotlyViolin();
            }
            case ESupportedPlotlyVis.STRIP: {
                return new PlotlyStrip();
            }
            case ESupportedPlotlyVis.PCP: {
                return new PlotlyPCP();
            }
            case ESupportedPlotlyVis.BAR: {
                return new PlotlyBar();
            }
        }
    }, [currentVis]);

    useEffect(() => {
        currPlot.startingHeuristic(props, selectedCatCols, selectedNumCols, updateSelectedCatCols, updateSelectedNumCols);
    }, [currentVis]);

    const traces: PlotlyInfo = useMemo(() => {
        return currPlot.createTraces(props, allExtraDropdowns, selectedCatCols, selectedNumCols);
    }, [allExtraDropdowns, selectedCatCols, selectedNumCols, currentVis, props.columns]);

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
            dragmode: isRectBrush ? 'select' : 'lasso',
            barmode: barGroupType === EBarGroupingType.STACK ? 'stack' : 'group'
        };

        return beautifyLayout(traces, layout);
    }, [traces, barGroupType, isRectBrush, currentVis]);

    return (
        <div className="d-flex flex-row w-100 h-100">
            {currPlot ? (
                <>
                    <div className="position-relative d-flex justify-content-center align-items-center flex-grow-1">
                        {traces.plots.length > 0 ?
                            (<Plot
                                divId={'plotlyDiv'}
                                data={[...traces.plots.map((p) => p.data), ...traces.legendPlots.map((p) => p.data)]}
                                layout={layout as any}
                                config={{responsive: true, displayModeBar: false}}
                                useResizeHandler={true}
                                style={{width: '100%', height: '100%'}}
                                onSelected={(d) => d ? props.selectionCallback(d.points.map((d) => (d as any).id)) : props.selectionCallback([])}
                                //plotly redraws everything on updates, so you need to reappend title and
                                // change opacity on update, instead of just in a use effect
                                onInitialized={() => {
                                    d3.selectAll('g .traces').style('opacity', alphaValue);
                                    d3.selectAll('.scatterpts').style('opacity', alphaValue);

                                }}
                                onUpdate={() => {
                                    d3.selectAll('g .traces').style('opacity', alphaValue);
                                    d3.selectAll('.scatterpts').style('opacity', alphaValue);

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
                        <div className="position-absolute d-flex justify-content-center align-items-center top-0 start-50">
                            <div className="btn-group" role="group">
                                <input checked={isRectBrush} onChange={(e) => setIsRectBrush(true)} type="checkbox" className="btn-check" id={`rectBrushSelection`} autoComplete="off"/>
                                <label className={`btn btn-outline-primary`} htmlFor={`rectBrushSelection`}><FontAwesomeIcon icon={faSquare} /></label>

                                <input checked={!isRectBrush} onChange={(e) => setIsRectBrush(false)} type="checkbox" className="btn-check" id={`lassoBrushSelection`} autoComplete="off"/>
                                <label className={`btn btn-outline-primary`} htmlFor={`lassoBrushSelection`}><FontAwesomeIcon icon={faPaintBrush} /></label>


                            </div>
                            <div className="ps-2 pt-0 m-0">
                                <label htmlFor={`alphaSlider`}  className={`form-label m-0 p-0`}>Opacity</label>
                                <input type="range" onChange={(e) => updateAlphaValue(+e.currentTarget.value)} className="form-range" min="=0" max="1" step=".1" id={`alphaSlider`}/>
                            </div>
                        </div>
                    </div>

                    <GeneralSidePanel
                        filterCallback={props.filterCallback}
                        currentVis={currentVis}
                        setCurrentVis={updateCurrentVis}
                        selectedCatCols={selectedCatCols}
                        updateSelectedCatCols={updateSelectedCatCols}
                        selectedNumCols={selectedNumCols}
                        updateSelectedNumCols={updateSelectedNumCols}
                        columns={props.columns}
                        dropdowns={traces.formList.map((t) => allExtraDropdowns[t])}
                    ></GeneralSidePanel>
                </>
            ) : null}
        </div>
    );
}
