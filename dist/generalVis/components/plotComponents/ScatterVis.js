import * as React from 'react';
import { useMemo } from 'react';
import { VisTypeSelect } from '../sidebarComponents/VisTypeSelect';
import { NumericalColumnSelect } from '../sidebarComponents/NumericalColumnSelect';
import { ColorSelect } from '../sidebarComponents/ColorSelect';
import { ShapeSelect } from '../sidebarComponents/ShapeSelect';
import { FilterButtons } from '../sidebarComponents/FilterButtons';
import Plot from 'react-plotly.js';
import { InvalidCols } from '../InvalidCols';
import d3 from 'd3';
import { createScatterTraces } from '../../traces/scatter';
import { beautifyLayout } from '../../utils/layoutUtils';
export function ScatterVis({ config, optionsConfig = {
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
}, columns, filterCallback, selectionCallback, selected, setConfig, scales }) {
    const traces = useMemo(() => {
        return createScatterTraces(columns, selected, config, scales);
    }, [columns, selected, config, scales]);
    const layout = useMemo(() => {
        const layout = {
            showlegend: true,
            legend: {
                itemclick: false,
                itemdoubleclick: false
            },
            autosize: true,
            grid: { rows: traces.rows, columns: traces.cols, xgap: .3, pattern: 'independent' },
            shapes: [],
            violingap: 0,
            dragmode: config.isRectBrush ? 'select' : 'lasso',
        };
        return beautifyLayout(traces, layout);
    }, [traces, config.isRectBrush]);
    return (React.createElement("div", { className: "d-flex flex-row w-100 h-100" },
        React.createElement("div", { className: "position-relative d-flex justify-content-center align-items-center flex-grow-1" }, traces.plots.length > 0 ?
            (React.createElement(Plot, { divId: 'plotlyDiv', data: [...traces.plots.map((p) => p.data), ...traces.legendPlots.map((p) => p.data)], layout: layout, config: { responsive: true, displayModeBar: false }, useResizeHandler: true, style: { width: '100%', height: '100%' }, onSelected: (d) => {
                    console.log(d);
                    d ? selectionCallback(d.points.map((d) => +d.id)) : selectionCallback([]);
                }, 
                //plotly redraws everything on updates, so you need to reappend title and
                // change opacity on update, instead of just in a use effect
                onInitialized: () => {
                    d3.selectAll('g .traces').style('opacity', config.alphaSliderVal);
                    d3.selectAll('.scatterpts').style('opacity', config.alphaSliderVal);
                }, onUpdate: () => {
                    d3.selectAll('g .traces').style('opacity', config.alphaSliderVal);
                    d3.selectAll('.scatterpts').style('opacity', config.alphaSliderVal);
                    for (const p of traces.plots) {
                        d3.select(`g .${p.data.xaxis}title`)
                            .style('pointer-events', 'all')
                            .append('title')
                            .text(p.xLabel);
                        d3.select(`g .${p.data.yaxis}title`)
                            .style('pointer-events', 'all')
                            .append('title')
                            .text(p.yLabel);
                    }
                } })) : (React.createElement(InvalidCols, { message: traces.errorMessage }))),
        React.createElement("div", { className: "position-relative h-100 flex-shrink-1 bg-light" },
            React.createElement("button", { className: "btn btn-primary-outline", type: "button", "data-bs-toggle": "collapse", "data-bs-target": "#generalVisBurgerMenu", "aria-expanded": "true", "aria-controls": "generalVisBurgerMenu" },
                React.createElement("i", { className: "fas fa-bars" })),
            React.createElement("div", { className: "collapse show collapse-horizontal", id: "generalVisBurgerMenu" },
                React.createElement("div", { className: "container", style: { width: '20rem' } },
                    React.createElement(VisTypeSelect, { callback: (type) => setConfig({ ...config, type }), currentSelected: config.type }),
                    React.createElement("hr", null),
                    React.createElement(NumericalColumnSelect, { callback: (numColumnsSelected) => setConfig({ ...config, numColumnsSelected }), columns: columns, currentSelected: config.numColumnsSelected }),
                    React.createElement("hr", null),
                    optionsConfig.color.enable ? optionsConfig.color.customComponent
                        || React.createElement(ColorSelect, { callback: (color) => setConfig({ ...config, color }), numTypeCallback: (numColorScaleType) => setConfig({ ...config, numColorScaleType }), currentNumType: config.numColorScaleType, columns: columns, currentSelected: config.color }) : null,
                    optionsConfig.shape.enable ? optionsConfig.shape.customComponent
                        || React.createElement(ShapeSelect, { callback: (shape) => setConfig({ ...config, shape }), columns: columns, currentSelected: config.shape }) : null,
                    React.createElement("hr", null),
                    optionsConfig.filter.enable ? optionsConfig.filter.customComponent
                        || React.createElement(FilterButtons, { callback: filterCallback }) : null)))));
}
//# sourceMappingURL=ScatterVis.js.map