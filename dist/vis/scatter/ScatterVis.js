import * as React from 'react';
import { useEffect, useMemo } from 'react';
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
import Plotly from 'plotly.js';
import { BrushOptionButtons } from '../sidebar/BrushOptionButtons';
import { OpacitySlider } from '../sidebar/OpacitySlider';
import { WarningMessage } from '../sidebar/WarningMessage';
import { useAsync } from '../..';
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
    const mergedOptionsConfig = useMemo(() => {
        return merge({}, defaultConfig, optionsConfig);
    }, []);
    const mergedExtensions = useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, []);
    const { value: traces, status: traceStatus, error: traceError } = useAsync(createScatterTraces, [columns, selected, config, scales, shapes]);
    console.log(traces, traceStatus, traceError);
    const layout = useMemo(() => {
        if (!traces) {
            return null;
        }
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
    return (React.createElement("div", { className: "d-flex flex-row w-100 h-100", style: { minHeight: '0px' } },
        React.createElement("div", { className: "position-relative d-flex justify-content-center align-items-center flex-grow-1" },
            mergedExtensions.prePlot,
            traceStatus === 'success' && (traces === null || traces === void 0 ? void 0 : traces.plots.length) > 0 ?
                React.createElement(Plot, { divId: `plotlyDiv${uniqueId}`, data: [...traces.plots.map((p) => p.data), ...traces.legendPlots.map((p) => p.data)], layout: layout, config: { responsive: true, displayModeBar: false }, useResizeHandler: true, style: { width: '100%', height: '100%' }, onSelected: (d) => {
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
                    } }) :
                traceStatus !== 'pending' ? React.createElement(InvalidCols, { message: (traceError === null || traceError === void 0 ? void 0 : traceError.message) || (traces === null || traces === void 0 ? void 0 : traces.errorMessage) }) : null,
            React.createElement("div", { className: "position-absolute d-flex justify-content-center align-items-center top-0 start-50 translate-middle-x" },
                React.createElement(BrushOptionButtons, { callback: (e) => setConfig({ ...config, isRectBrush: e }), isRectBrush: config.isRectBrush }),
                React.createElement(OpacitySlider, { callback: (e) => setConfig({ ...config, alphaSliderVal: e }), currentValue: config.alphaSliderVal })),
            mergedExtensions.postPlot),
        React.createElement("div", { className: "position-relative h-100 flex-shrink-1 bg-light overflow-auto" },
            React.createElement("button", { className: "btn btn-primary-outline", type: "button", "data-bs-toggle": "collapse", "data-bs-target": `#generalVisBurgerMenu${uniqueId}`, "aria-expanded": "true", "aria-controls": "generalVisBurgerMenu" },
                React.createElement("i", { className: "fas fa-bars" })),
            React.createElement("div", { className: "collapse show collapse-horizontal", id: `generalVisBurgerMenu${uniqueId}` },
                React.createElement("div", { className: "container pb-3", style: { width: '20rem' } },
                    React.createElement(WarningMessage, null),
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