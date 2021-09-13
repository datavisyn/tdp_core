import d3 from 'd3';
import {scale} from 'd3';
import {Data, Layout} from 'plotly.js';
import * as React from 'react';
import {useEffect, useMemo, useState} from 'react';
import Plot, {Figure} from 'react-plotly.js';
import {GeneralPlot} from '../types/generalPlotInterface';
import {InvalidCols} from './InvalidCols';
import {GeneralSidePanel} from './GeneralSidePanel';
import {PlotlyBar} from '../visTypes/bar';
import {PlotlyPCP} from '../visTypes/pcp';
import {PlotlyScatter} from '../visTypes/scatter';
import {PlotlyStrip} from '../visTypes/strip';
import {PlotlyViolin} from '../visTypes/violin';
import {AllDropdownOptions, CategoricalColumn, PlotlyInfo, GeneralHomeProps, NumericalColumn, supportedPlotlyVis} from '../types/generalTypes';
import {beautifyLayout} from '../utils/layoutUtils';

export function GeneralHome(props: GeneralHomeProps) {
    const [currentVis, setCurrentVis] = useState<supportedPlotlyVis>('Scatter');
    const [selectedCatCols, setSelectedCatCols] = useState<string[]>(
        props.columns.filter((c) => c.selectedForMultiples === true && c.type === 'categorical').map((c) => c.name)
    );
    const [selectedNumCols, setSelectedNumCols] = useState<string[]>(
        props.columns.filter((c) => c.selectedForMultiples === true && c.type === 'number').map((c) => c.name)
    );

    const [bubbleSize, setBubbleSize] = useState<NumericalColumn | null>(null);
    const [colorMapping, setColorMapping] = useState<CategoricalColumn | null>(null);
    const [opacity, setOpacity] = useState<NumericalColumn | null>(null);
    const [shape, setShape] = useState<CategoricalColumn | null>(null);
    const [barGroup, setBarGroup] = useState<CategoricalColumn | null>(null);
    const [barMultiples, setBarMultiples] = useState<CategoricalColumn | null>(null);
    const [barNormalized, setBarNormalized] = useState<string>('Default');
    const [barGroupType, setBarGroupType] = useState<string>('Stacked');
    const [barDirection, setBarDirection] = useState<string>('Vertical');

    const updateBubbleSize = (newCol: string) => setBubbleSize(props.columns.filter((c) => c.name === newCol && c.type === 'number')[0] as NumericalColumn);
    const updateOpacity = (newCol: string) => setOpacity(props.columns.filter((c) => c.name === newCol && c.type === 'number')[0] as NumericalColumn);
    const updateColor = (newCol: string) => setColorMapping(props.columns.filter((c) => c.name === newCol && c.type === 'categorical')[0] as CategoricalColumn);
    const updateShape = (newCol: string) => setShape(props.columns.filter((c) => c.name === newCol && c.type === 'categorical')[0] as CategoricalColumn);
    const updateBarGroup = (newCol: string) => setBarGroup(props.columns.filter((c) => c.name === newCol && c.type === 'categorical')[0] as CategoricalColumn);
    const updateBarMultiples = (newCol: string) => setBarMultiples(props.columns.filter((c) => c.name === newCol && c.type === 'categorical')[0] as CategoricalColumn);

    const updateCurrentVis = (s: supportedPlotlyVis) => setCurrentVis(s);
    const updateSelectedCatCols = (s: string[]) => setSelectedCatCols(s);
    const updateSelectedNumCols = (s: string[]) => setSelectedNumCols(s);

    const updateBarNormalized = (s: string) => setBarNormalized(s);
    const updateBarGroupType = (s: string) => setBarGroupType(s);
    const updateBarDirection = (s: string) => setBarDirection(s);

    const shapeScale = useMemo(() => {
        return shape ?
            scale.ordinal<string>().domain(d3.set(shape.vals.map((v) => v.val)).values()).range(['circle', 'square', 'triangle-up', 'star'])
            : null;
    }, [shape]);

    const bubbleScale = useMemo(() => {
        return bubbleSize ?
            scale.linear().domain([0, d3.max(bubbleSize.vals.map((v) => v.val))]).range([0, 10])
            : null;
    }, [bubbleSize]);

    const opacityScale = useMemo(() => {
        return opacity ?
            scale.linear().domain([0, d3.max(opacity.vals.map((v) => v.val))]).range([0, 1])
            : null;
    }, [opacity]);

    const colorScale = useMemo(() => {
        return scale.ordinal().range(['#337ab7', '#ec6836', '#75c4c2', '#e9d36c', '#24b466', '#e891ae', '#db933c', '#b08aa6', '#8a6044', '#7b7b7b']);
    }, [colorMapping]);

    const allExtraDropdowns: AllDropdownOptions = {
        bubble: {
            name: 'Bubble Size',
            callback: updateBubbleSize,
            scale: bubbleScale,
            currentColumn: bubbleSize ? bubbleSize : null,
            currentSelected: bubbleSize ? bubbleSize.name : null,
            options: props.columns.filter((c) => c.type === 'number').map((c) => c.name),
            type: 'dropdown',
            active: true
        },
        opacity: {
            name: 'Opacity',
            callback: updateOpacity,
            scale: opacityScale,
            currentColumn: opacity ? opacity : null,
            currentSelected: opacity ? opacity.name : null,

            options: props.columns.filter((c) => c.type === 'number').map((c) => c.name),
            type: 'dropdown',
            active: true
        },
        color: {
            name: 'Color',
            callback: updateColor,
            scale: colorScale,
            currentColumn: colorMapping ? colorMapping : null,
            currentSelected: colorMapping ? colorMapping.name : null,

            options: props.columns.filter((c) => c.type === 'categorical').map((c) => c.name),
            type: 'dropdown',
            active: true
        },
        shape: {
            name: 'Shape',
            callback: updateShape,
            scale: shapeScale,
            currentColumn: shape ? shape : null,
            currentSelected: shape ? shape.name : null,

            options: props.columns.filter((c) => c.type === 'categorical').map((c) => c.name),
            type: 'dropdown',
            active: true
        },
        groupBy: {
            name: 'Group',
            callback: updateBarGroup,
            scale: null,
            currentColumn: barGroup ? barGroup : null,
            currentSelected: barGroup ? barGroup.name : null,

            options: props.columns.filter((c) => c.type === 'categorical').map((c) => c.name),
            type: 'dropdown',
            active: true
        },
        barMultiplesBy: {
            name: 'Small Multiples',
            callback: updateBarMultiples,
            scale: null,
            currentColumn: barMultiples ? barMultiples : null,
            currentSelected: barMultiples ? barMultiples.name : null,

            options: props.columns.filter((c) => c.type === 'categorical').map((c) => c.name),
            type: 'dropdown',
            active: true
        },
        filter: {
            name: 'Filter',
            callback: props.filterCallback,
            scale: null,
            currentColumn: null,
            currentSelected: '',

            options: ['Filter In', 'Filter Out', 'Clear'],
            type: 'button',
            active: true
        },
        barDirection: {
            name: 'Bar Direction',
            callback: updateBarDirection,
            scale: null,
            currentColumn: null,
            currentSelected: barDirection,
            options: ['Vertical', 'Horizontal'],
            type: 'button',
            active: true
        },
        barGroupType: {
            name: 'Bar Group By',
            callback: updateBarGroupType,
            scale: null,
            currentColumn: null,
            currentSelected: barGroupType,

            options: ['Stacked', 'Grouped'],
            type: 'button',
            active: barGroup !== null
        },
        barNormalized: {
            name: 'Bar Normalized',
            callback: updateBarNormalized,
            scale: null,
            currentColumn: null,
            currentSelected: barNormalized,

            options: ['Default', 'Normalized'],
            type: 'button',
            active: barGroup !== null
        }
    };

    const currPlot: GeneralPlot = useMemo(() => {
        switch (currentVis) {
            case 'Scatter': {
                return new PlotlyScatter();
            }
            case 'Violin': {
                return new PlotlyViolin();
            }
            case 'Strip': {
                return new PlotlyStrip();
            }
            case 'Parallel Coordinates': {
                return new PlotlyPCP();
            }
            case 'Bar': {
                return new PlotlyBar();
            }
        }
    }, [currentVis]);

    useEffect(() => {
        currPlot.startingHeuristic(props, selectedCatCols, selectedNumCols, updateSelectedCatCols, updateSelectedNumCols);
    }, [currentVis]);

    const traces: PlotlyInfo = useMemo(() => {
        return currPlot.createTraces(props, allExtraDropdowns, selectedCatCols, selectedNumCols);
    }, [allExtraDropdowns, selectedCatCols, selectedNumCols]);

    const layout = useMemo(() => {
        const layout = {
            showlegend: true,
            legend: {
                itemclick: false,
                itemdoubleclick: false
            },
            autosize: true,
            grid: {rows: traces.rows, columns: traces.cols, pattern: 'independent'},
            shapes: [],
            violingap: 0,
            dragmode: 'select',
            barmode: barGroupType === 'Stacked' ? 'stack' : 'group'
        };

        return beautifyLayout(traces, layout);
    }, [traces, barGroupType]);

    return (
        <div className="d-flex flex-row w-100 h-100">
            {currPlot ? (
                <>
                    <div className="d-flex justify-content-center align-items-center flex-grow-1">
                        {traces.plots.length > 0 ?
                            (<Plot
                                divId={'plotlyDiv'}
                                data={[...traces.plots.map((p) => p.data), ...traces.legendPlots.map((p) => p.data)]}
                                layout={layout as any}
                                config={{responsive: true}}
                                useResizeHandler={true}
                                style={{width: '100%', height: '100%'}}
                                onSelected={(d) => d ? props.selectionCallback(d.points.map((d) => (d as any).id)) : props.selectionCallback([])}
                                onInitialized={() => d3.selectAll('g .traces').style('opacity', 1)}
                                onUpdate={() => d3.selectAll('g .traces').style('opacity', 1)}
                            />) : (<InvalidCols
                                message={traces.errorMessage} />)
                        }
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
                        dropdowns={Object.values(allExtraDropdowns).filter((d) => traces.dropdownList.includes(d.name))}
                    ></GeneralSidePanel>
                </>
            ) : null}
        </div>
    );
}
