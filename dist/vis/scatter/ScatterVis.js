import * as React from 'react';
import d3 from 'd3';
import { merge, uniqueId } from 'lodash';
import { BrushOptionButtons, ColorSelect, FilterButtons, NumericalColumnSelect, OpacitySlider, ShapeSelect, VisTypeSelect, WarningMessage } from '../sidebar';
import { PlotlyComponent, Plotly } from '../Plot';
import { InvalidCols } from '../general';
import { createScatterTraces } from './utils';
import { beautifyLayout } from '../general/layoutUtils';
import { useAsync } from '../../hooks';
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
    },
};
const defaultExtensions = {
    prePlot: null,
    postPlot: null,
    preSidebar: null,
    postSidebar: null,
};
export function ScatterVis({ config, optionsConfig, extensions, columns, shapes = ['circle', 'square', 'triangle-up', 'star'], filterCallback = () => null, selectionCallback = () => null, selected = {}, setConfig, scales, }) {
    const id = React.useMemo(() => uniqueId('ScatterVis'), []);
    React.useEffect(() => {
        const menu = document.getElementById(`generalVisBurgerMenu${id}`);
        menu.addEventListener('hidden.bs.collapse', () => {
            Plotly.Plots.resize(document.getElementById(`plotlyDiv${id}`));
        });
        menu.addEventListener('shown.bs.collapse', () => {
            Plotly.Plots.resize(document.getElementById(`plotlyDiv${id}`));
        });
    }, []);
    const mergedOptionsConfig = React.useMemo(() => {
        return merge({}, defaultConfig, optionsConfig);
    }, []);
    const mergedExtensions = React.useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, []);
    const { value: traces, status: traceStatus, error: traceError } = useAsync(createScatterTraces, [columns, selected, config, scales, shapes]);
    const layout = React.useMemo(() => {
        if (!traces) {
            return null;
        }
        const layout = {
            showlegend: true,
            legend: {
                // @ts-ignore
                itemclick: false,
                itemdoubleclick: false,
            },
            autosize: true,
            grid: { rows: traces.rows, columns: traces.cols, xgap: 0.3, pattern: 'independent' },
            shapes: [],
            violingap: 0,
            dragmode: config.isRectBrush ? 'select' : 'lasso',
        };
        return beautifyLayout(traces, layout);
    }, [traces, config.isRectBrush]);
    return (React.createElement("div", { className: "d-flex flex-row w-100 h-100", style: { minHeight: '0px' } },
        React.createElement("div", { className: `position-relative d-flex justify-content-center align-items-center flex-grow-1 ${traceStatus === 'pending' ? 'tdp-busy-partial-overlay' : ''}` },
            mergedExtensions.prePlot,
            traceStatus === 'success' && (traces === null || traces === void 0 ? void 0 : traces.plots.length) > 0 ? (React.createElement(PlotlyComponent, { divId: `plotlyDiv${id}`, data: [...traces.plots.map((p) => p.data), ...traces.legendPlots.map((p) => p.data)], layout: layout, config: { responsive: true, displayModeBar: false }, useResizeHandler: true, style: { width: '100%', height: '100%' }, onSelected: (d) => {
                    d ? selectionCallback(d.points.map((d) => +d.id)) : selectionCallback([]);
                }, 
                // plotly redraws everything on updates, so you need to reappend title and
                // change opacity on update, instead of just in a use effect
                onInitialized: () => {
                    d3.selectAll('g .traces').style('opacity', config.alphaSliderVal);
                    d3.selectAll('.scatterpts').style('opacity', config.alphaSliderVal);
                }, onUpdate: () => {
                    d3.selectAll('g .traces').style('opacity', config.alphaSliderVal);
                    d3.selectAll('.scatterpts').style('opacity', config.alphaSliderVal);
                    for (const p of traces.plots) {
                        d3.select(`g .${p.data.xaxis}title`).style('pointer-events', 'all').append('title').text(p.xLabel);
                        d3.select(`g .${p.data.yaxis}title`).style('pointer-events', 'all').append('title').text(p.yLabel);
                    }
                } })) : traceStatus !== 'pending' ? (React.createElement(InvalidCols, { message: (traceError === null || traceError === void 0 ? void 0 : traceError.message) || (traces === null || traces === void 0 ? void 0 : traces.errorMessage) })) : null,
            React.createElement("div", { className: "position-absolute d-flex justify-content-center align-items-center top-0 start-50 translate-middle-x" },
                React.createElement(BrushOptionButtons, { callback: (e) => setConfig({ ...config, isRectBrush: e }), isRectBrush: config.isRectBrush }),
                React.createElement(OpacitySlider, { callback: (e) => setConfig({ ...config, alphaSliderVal: e }), currentValue: config.alphaSliderVal })),
            mergedExtensions.postPlot),
        React.createElement("div", { className: "position-relative h-100 flex-shrink-1 bg-light overflow-auto" },
            React.createElement("button", { className: "btn btn-primary-outline", type: "button", "data-bs-toggle": "collapse", "data-bs-target": `#generalVisBurgerMenu${id}`, "aria-expanded": "true", "aria-controls": "generalVisBurgerMenu" },
                React.createElement("i", { className: "fas fa-bars" })),
            React.createElement("div", { className: "collapse show collapse-horizontal", id: `generalVisBurgerMenu${id}` },
                React.createElement("div", { className: "container pb-3", style: { width: '20rem' } },
                    React.createElement(WarningMessage, null),
                    React.createElement(VisTypeSelect, { callback: (type) => setConfig({ ...config, type }), currentSelected: config.type }),
                    React.createElement("hr", null),
                    React.createElement(NumericalColumnSelect, { callback: (numColumnsSelected) => setConfig({ ...config, numColumnsSelected }), columns: columns, currentSelected: config.numColumnsSelected || [] }),
                    React.createElement("hr", null),
                    mergedExtensions.preSidebar,
                    mergedOptionsConfig.color.enable
                        ? mergedOptionsConfig.color.customComponent || (React.createElement(ColorSelect, { callback: (color) => setConfig({ ...config, color }), numTypeCallback: (numColorScaleType) => setConfig({ ...config, numColorScaleType }), currentNumType: config.numColorScaleType, columns: columns, currentSelected: config.color }))
                        : null,
                    mergedOptionsConfig.shape.enable
                        ? mergedOptionsConfig.shape.customComponent || (React.createElement(ShapeSelect, { callback: (shape) => setConfig({ ...config, shape }), columns: columns, currentSelected: config.shape }))
                        : null,
                    React.createElement("hr", null),
                    mergedOptionsConfig.filter.enable ? mergedOptionsConfig.filter.customComponent || React.createElement(FilterButtons, { callback: filterCallback }) : null,
                    mergedExtensions.postSidebar)))));
}
//# sourceMappingURL=ScatterVis.js.map