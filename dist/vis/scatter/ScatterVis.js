import * as React from 'react';
import { useMemo } from 'react';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { NumericalColumnSelect } from '../sidebar/NumericalColumnSelect';
import { ColorSelect } from '../sidebar/ColorSelect';
import { ShapeSelect } from '../sidebar/ShapeSelect';
import { FilterButtons } from '../sidebar/FilterButtons';
import Plot from 'react-plotly.js';
import { InvalidCols } from '../InvalidCols';
import d3 from 'd3';
import { createScatterTraces } from './utils';
import { beautifyLayout } from '../layoutUtils';
import { merge } from 'lodash';
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
export function ScatterVis({ config, optionsConfig, extensions, columns, shapes = ['circle', 'square', 'triangle-up', 'star'], filterCallback = () => null, selectionCallback = () => null, selected = {}, setConfig, scales }) {
    const mergedOptionsConfig = useMemo(() => {
        return merge({}, defaultConfig, optionsConfig);
    }, []);
    const mergedExtensions = useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, []);
    const traces = useMemo(() => {
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
            grid: { rows: traces.rows, columns: traces.cols, xgap: .3, pattern: 'independent' },
            shapes: [],
            violingap: 0,
            dragmode: config.isRectBrush ? 'select' : 'lasso',
        };
        return beautifyLayout(traces, layout);
    }, [traces, config.isRectBrush]);
    return (React.createElement("div", { className: "d-flex flex-row w-100 h-100" },
        React.createElement("div", { className: "position-relative d-flex justify-content-center align-items-center flex-grow-1" },
            mergedExtensions.prePlot,
            traces.plots.length > 0 ?
                (React.createElement(Plot, { divId: 'plotlyDiv', data: [...traces.plots.map((p) => p.data), ...traces.legendPlots.map((p) => p.data)], layout: layout, config: { responsive: true, displayModeBar: false }, useResizeHandler: true, style: { width: '100%', height: '100%' }, onSelected: (d) => {
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
                    } })) : (React.createElement(InvalidCols, { message: traces.errorMessage })),
            React.createElement("div", { className: "position-absolute d-flex justify-content-center align-items-center top-0 start-50 translate-middle-x" },
                React.createElement("div", { className: "btn-group", role: "group" },
                    React.createElement("input", { checked: config.isRectBrush, onChange: (e) => setConfig({ ...config, isRectBrush: true }), type: "checkbox", className: "btn-check", id: `rectBrushSelection`, autoComplete: "off" }),
                    React.createElement("label", { className: `btn btn-outline-primary`, htmlFor: `rectBrushSelection`, title: "Rectangular Brush" },
                        React.createElement("i", { className: "far fa-square" })),
                    React.createElement("input", { checked: !config.isRectBrush, onChange: (e) => setConfig({ ...config, isRectBrush: false }), type: "checkbox", className: "btn-check", id: `lassoBrushSelection`, autoComplete: "off" }),
                    React.createElement("label", { className: `btn btn-outline-primary`, htmlFor: `lassoBrushSelection`, title: "Lasso Brush" },
                        React.createElement("i", { className: "fas fa-paint-brush" }))),
                React.createElement("div", { className: "ps-2 pt-0 m-0" },
                    React.createElement("label", { htmlFor: `alphaSlider`, className: `form-label m-0 p-0` }, "Opacity"),
                    React.createElement("input", { type: "range", onChange: (e) => setConfig({ ...config, alphaSliderVal: +e.currentTarget.value }), className: "form-range", value: config.alphaSliderVal, min: "=0", max: "1", step: ".1", id: `alphaSlider` }))),
            mergedExtensions.postPlot),
        React.createElement("div", { className: "position-relative h-100 flex-shrink-1 bg-light" },
            React.createElement("button", { className: "btn btn-primary-outline", type: "button", "data-bs-toggle": "collapse", "data-bs-target": "#generalVisBurgerMenu", "aria-expanded": "true", "aria-controls": "generalVisBurgerMenu" },
                React.createElement("i", { className: "fas fa-bars" })),
            React.createElement("div", { className: "collapse show collapse-horizontal", id: "generalVisBurgerMenu" },
                React.createElement("div", { className: "container", style: { width: '20rem' } },
                    React.createElement(VisTypeSelect, { callback: (type) => setConfig({ ...config, type }), currentSelected: config.type }),
                    React.createElement("hr", null),
                    React.createElement(NumericalColumnSelect, { callback: (numColumnsSelected) => setConfig({ ...config, numColumnsSelected }), columns: columns, currentSelected: config.numColumnsSelected || [] }),
                    React.createElement("hr", null),
                    mergedExtensions.preSidebar,
                    mergedOptionsConfig.color.enable ? mergedOptionsConfig.color.customComponent
                        || React.createElement(ColorSelect, { callback: (color) => setConfig({ ...config, color }), numTypeCallback: (numColorScaleType) => setConfig({ ...config, numColorScaleType }), currentNumType: config.numColorScaleType, columns: columns, currentSelected: config.color }) : null,
                    mergedOptionsConfig.shape.enable ? mergedOptionsConfig.shape.customComponent
                        || React.createElement(ShapeSelect, { callback: (shape) => setConfig({ ...config, shape }), columns: columns, currentSelected: config.shape }) : null,
                    React.createElement("hr", null),
                    mergedOptionsConfig.filter.enable ? mergedOptionsConfig.filter.customComponent
                        || React.createElement(FilterButtons, { callback: filterCallback }) : null,
                    mergedExtensions.postSidebar)))));
}
//# sourceMappingURL=ScatterVis.js.map