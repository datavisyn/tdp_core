import d3 from 'd3';
import { scale } from 'd3';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import { InvalidCols } from './InvalidCols';
import { MultiplesSidePanel } from './MultiplesSidePanel';
import { PlotlyPCP } from './PlotlyPCP';
import { PlotlyScatter } from './PlotlyScatterplot';
import { PlotlyStrip } from './PlotlyStripPlot';
import { PlotlyViolin } from './PlotlyViolinPlot';
export function Multiples(props) {
    const [currentVis, setCurrentVis] = useState('Scatter');
    const [selectedCatCols, setSelectedCatCols] = useState(props.columns.filter((c) => c.selectedForMultiples === true && c.type === 'categorical').map((c) => c.name));
    const [selectedNumCols, setSelectedNumCols] = useState(props.columns.filter((c) => c.selectedForMultiples === true && c.type === 'number').map((c) => c.name));
    const updateCurrentVis = (s) => setCurrentVis(s);
    const updateSelectedCatCols = (s) => setSelectedCatCols(s);
    const updateSelectedNumCols = (s) => setSelectedNumCols(s);
    useEffect(() => {
        if (selectedCatCols[0]) {
            props.updateColor(selectedCatCols[0]);
        }
        else {
            props.updateColor('');
        }
    }, [selectedCatCols[0]]);
    useEffect(() => {
        if (selectedCatCols[1]) {
            props.updateShape(selectedCatCols[1]);
        }
        else {
            props.updateShape('');
        }
    }, [selectedCatCols[1]]);
    const shapeScale = useMemo(() => {
        return props.shape ?
            scale.ordinal().domain(d3.set(props.shape.vals.map((v) => v.val)).values()).range(['circle', 'square', 'triangle-up', 'star'])
            : null;
    }, [props.shape]);
    const bubbleScale = useMemo(() => {
        return props.bubbleSize ?
            scale.linear().domain([0, d3.max(props.bubbleSize.vals.map((v) => v.val))]).range([0, 10])
            : null;
    }, [props.bubbleSize]);
    const opacityScale = useMemo(() => {
        return props.opacity ?
            scale.linear().domain([0, d3.max(props.opacity.vals.map((v) => v.val))]).range([0, 1])
            : null;
    }, [props.opacity]);
    const colorScale = useMemo(() => {
        return scale.ordinal().range(['#337ab7', '#ec6836', '#75c4c2', '#e9d36c', '#24b466', '#e891ae', '#db933c', '#b08aa6', '#8a6044', '#7b7b7b']);
    }, [props.color]);
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
    }
    useMemo(() => {
        currPlot.startingHeuristic(props, selectedCatCols, selectedNumCols, updateSelectedCatCols, updateSelectedNumCols);
    }, [currentVis]);
    const traces = currPlot.createTrace(props, selectedCatCols, selectedNumCols, shapeScale, colorScale, opacityScale, bubbleScale);
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
    return (React.createElement("div", { className: "d-flex flex-row w-100 h-100" },
        React.createElement("div", { className: "d-flex justify-content-center align-items-center flex-grow-1" }, traces.plots.length > 0 ?
            (React.createElement(Plot, { divId: 'plotlyDiv', data: [...traces.plots.map((p) => p.data), ...traces.legendPlots.map((p) => p.data)], layout: layout, config: { responsive: true }, useResizeHandler: true, style: { width: '100%', height: '100%' }, onSelected: (d) => d ? props.selectedCallback(d.points.map((d) => d.id)) : props.selectedCallback([]), onInitialized: () => d3.selectAll('g .traces').style('opacity', 1), onUpdate: () => d3.selectAll('g .traces').style('opacity', 1) })) : (React.createElement(InvalidCols, { message: traces.errorMessage }))),
        React.createElement(MultiplesSidePanel, { filterCallback: props.filterCallback, currentVis: currentVis, setCurrentVis: updateCurrentVis, selectedCatCols: selectedCatCols, updateSelectedCatCols: updateSelectedCatCols, selectedNumCols: selectedNumCols, updateSelectedNumCols: updateSelectedNumCols, columns: props.columns, currentType: props.type, dropdowns: [
                {
                    name: 'Bubble Size',
                    callback: props.updateBubbleSize,
                    currentSelected: props.bubbleSize ? props.bubbleSize.name : null,
                    options: props.columns.filter((c) => c.type === 'number').map((c) => c.name)
                },
                {
                    name: 'Opacity',
                    callback: props.updateOpacity,
                    currentSelected: props.opacity ? props.opacity.name : null,
                    options: props.columns.filter((c) => c.type === 'number').map((c) => c.name)
                },
                {
                    name: 'Color',
                    callback: props.updateColor,
                    currentSelected: props.color ? props.color.name : null,
                    options: props.columns.filter((c) => c.type === 'categorical').map((c) => c.name)
                },
                {
                    name: 'Shape',
                    callback: props.updateShape,
                    currentSelected: props.shape ? props.shape.name : null,
                    options: props.columns.filter((c) => c.type === 'categorical').map((c) => c.name)
                },
            ], chartTypeChangeCallback: props.updateChartType })));
}
//# sourceMappingURL=Multiples.js.map