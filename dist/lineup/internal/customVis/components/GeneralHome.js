import d3 from 'd3';
import { scale } from 'd3';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import { InvalidCols } from '../InvalidCols';
import { MultiplesSidePanel } from './GeneralSidePanel';
import { PlotlyBar } from '../visTypes/bar';
import { PlotlyPCP } from '../visTypes/pcp';
import { PlotlyScatter } from '../visTypes/scatter';
import { PlotlyStrip } from '../visTypes/strip';
import { PlotlyViolin } from '../visTypes/violin';
export const chartTypes = ['Scatter', 'Parallel Coordinates', 'Violin', 'Strip', 'Multiples'];
export const correlationTypes = ['Scatter'];
export const distributionTypes = ['Violin', 'Strip', 'Bar'];
export const highDimensionalTypes = ['Parallel Coordinates'];
export function Multiples(props) {
    const [currentVis, setCurrentVis] = useState('Scatter');
    const [selectedCatCols, setSelectedCatCols] = useState(props.columns.filter((c) => c.selectedForMultiples === true && c.type === 'categorical').map((c) => c.name));
    const [selectedNumCols, setSelectedNumCols] = useState(props.columns.filter((c) => c.selectedForMultiples === true && c.type === 'number').map((c) => c.name));
    const [bubbleSize, setBubbleSize] = useState(null);
    const [colorMapping, setColorMapping] = useState(null);
    const [opacity, setOpacity] = useState(null);
    const [shape, setShape] = useState(null);
    const [barGroup, setBarGroup] = useState(null);
    const [barMultiples, setBarMultiples] = useState(null);
    const [barNormalized, setBarNormalized] = useState('Default');
    const [barGroupType, setBarGroupType] = useState('Stacked');
    const [barDirection, setBarDirection] = useState('Vertical');
    const updateBubbleSize = (newCol) => setBubbleSize(props.columns.filter((c) => c.name === newCol && c.type === 'number')[0]);
    const updateOpacity = (newCol) => setOpacity(props.columns.filter((c) => c.name === newCol && c.type === 'number')[0]);
    const updateColor = (newCol) => setColorMapping(props.columns.filter((c) => c.name === newCol && c.type === 'categorical')[0]);
    const updateShape = (newCol) => setShape(props.columns.filter((c) => c.name === newCol && c.type === 'categorical')[0]);
    const updateBarGroup = (newCol) => setBarGroup(props.columns.filter((c) => c.name === newCol && c.type === 'categorical')[0]);
    const updateBarMultiples = (newCol) => setBarMultiples(props.columns.filter((c) => c.name === newCol && c.type === 'categorical')[0]);
    const updateCurrentVis = (s) => setCurrentVis(s);
    const updateSelectedCatCols = (s) => setSelectedCatCols(s);
    const updateSelectedNumCols = (s) => setSelectedNumCols(s);
    const updateBarNormalized = (s) => setBarNormalized(s);
    const updateBarGroupType = (s) => setBarGroupType(s);
    const updateBarDirection = (s) => setBarDirection(s);
    useEffect(() => {
        if (selectedCatCols[0]) {
            updateColor(selectedCatCols[0]);
        }
        else {
            updateColor('');
        }
    }, [selectedCatCols[0]]);
    useEffect(() => {
        if (selectedCatCols[1]) {
            updateShape(selectedCatCols[1]);
        }
        else {
            updateShape('');
        }
    }, [selectedCatCols[1]]);
    const shapeScale = useMemo(() => {
        return shape ?
            scale.ordinal().domain(d3.set(shape.vals.map((v) => v.val)).values()).range(['circle', 'square', 'triangle-up', 'star'])
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
    const allExtraDropdowns = {
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
    let currPlot = undefined;
    switch (currentVis) {
        case 'Scatter': {
            currPlot = new PlotlyScatter();
            break;
        }
        case 'Violin': {
            currPlot = new PlotlyViolin();
            break;
        }
        case 'Strip': {
            currPlot = new PlotlyStrip();
            break;
        }
        case 'Parallel Coordinates': {
            currPlot = new PlotlyPCP();
            break;
        }
        case 'Bar': {
            currPlot = new PlotlyBar();
            break;
        }
    }
    useMemo(() => {
        currPlot.startingHeuristic(props, selectedCatCols, selectedNumCols, updateSelectedCatCols, updateSelectedNumCols);
    }, [currentVis]);
    const traces = currPlot.createTrace(props, allExtraDropdowns, selectedCatCols, selectedNumCols);
    const layout = {
        showlegend: true,
        legend: {
            itemclick: false,
            itemdoubleclick: false
        },
        autosize: true,
        grid: { rows: traces.rows, columns: traces.cols, pattern: 'independent' },
        shapes: [],
        violingap: 0,
        dragmode: 'select',
        barmode: barGroupType === 'Stacked' ? 'stack' : 'group'
    };
    traces.plots.forEach((t, i) => {
        layout[`xaxis${i > 0 ? i + 1 : ''}`] = {
            showline: true,
            ticks: 'outside',
            title: {
                standoff: 5,
                text: t.xLabel,
                font: {
                    family: 'Courier New, monospace',
                    size: 14,
                    color: '#7f7f7f'
                }
            },
        };
        layout[`yaxis${i > 0 ? i + 1 : ''}`] = {
            showline: true,
            ticks: 'outside',
            title: {
                text: t.yLabel,
                font: {
                    family: 'Courier New, monospace',
                    size: 14,
                    color: '#7f7f7f'
                }
            },
        };
        layout.shapes.push({
            type: 'line',
            xref: `x${i > 0 ? i + 1 : ''} domain`,
            yref: `y${i > 0 ? i + 1 : ''} domain`,
            x0: 0,
            y0: 1,
            x1: 1,
            y1: 1,
            line: {
                color: 'rgb(238, 238, 238)',
                width: 2
            },
            opacity: 1,
            row: 2,
            col: 2
        });
        layout.shapes.push({
            type: 'line',
            xref: `x${i > 0 ? i + 1 : ''} domain`,
            yref: `y${i > 0 ? i + 1 : ''} domain`,
            x0: 1,
            y0: 0,
            x1: 1,
            y1: 1,
            line: {
                color: 'rgb(238, 238, 238)',
                width: 2
            },
            opacity: 1,
            row: 2,
            col: 2
        });
    });
    console.log(traces);
    return (React.createElement("div", { className: "d-flex flex-row w-100 h-100" },
        React.createElement("div", { className: "d-flex justify-content-center align-items-center flex-grow-1" }, traces.plots.length > 0 ?
            (React.createElement(Plot, { divId: 'plotlyDiv', data: [...traces.plots.map((p) => p.data), ...traces.legendPlots.map((p) => p.data)], layout: layout, config: { responsive: true }, useResizeHandler: true, style: { width: '100%', height: '100%' }, onSelected: (d) => d ? props.selectionCallback(d.points.map((d) => d.id)) : props.selectionCallback([]), onInitialized: () => d3.selectAll('g .traces').style('opacity', 1), onUpdate: () => d3.selectAll('g .traces').style('opacity', 1) })) : (React.createElement(InvalidCols, { message: traces.errorMessage }))),
        React.createElement(MultiplesSidePanel, { filterCallback: props.filterCallback, currentVis: currentVis, setCurrentVis: updateCurrentVis, selectedCatCols: selectedCatCols, updateSelectedCatCols: updateSelectedCatCols, selectedNumCols: selectedNumCols, updateSelectedNumCols: updateSelectedNumCols, columns: props.columns, currentType: props.type, dropdowns: Object.values(allExtraDropdowns).filter((d) => traces.dropdownList.includes(d.name)) })));
}
//# sourceMappingURL=GeneralHome.js.map