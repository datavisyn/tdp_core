import * as React from 'react';
import { CategoricalColumnSelect, NumericalColumnSelect, ViolinOverlayButtons, VisTypeSelect, WarningMessage } from '../sidebar';
import { PlotlyComponent, Plotly } from '../Plot';
import { InvalidCols } from '../general';
import d3 from 'd3';
import { beautifyLayout } from '../general/layoutUtils';
import { createViolinTraces } from './utils';
import { merge } from 'lodash';
import { useAsync } from '../../hooks';
const defaultConfig = {
    overlay: {
        enable: true,
        customComponent: null
    }
};
const defaultExtensions = {
    prePlot: null,
    postPlot: null,
    preSidebar: null,
    postSidebar: null
};
export function ViolinVis({ config, optionsConfig, extensions, columns, setConfig, scales }) {
    const mergedOptionsConfig = React.useMemo(() => {
        return merge({}, defaultConfig, optionsConfig);
    }, []);
    const mergedExtensions = React.useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, []);
    const { value: traces, status: traceStatus, error: traceError } = useAsync(createViolinTraces, [columns, config, scales]);
    const uniqueId = React.useMemo(() => {
        return Math.random().toString(36).substr(2, 5);
    }, []);
    React.useEffect(() => {
        const menu = document.getElementById(`generalVisBurgerMenu${uniqueId}`);
        menu.addEventListener('hidden.bs.collapse', () => {
            Plotly.Plots.resize(document.getElementById(`plotlyDiv${uniqueId}`));
        });
        menu.addEventListener('shown.bs.collapse', () => {
            Plotly.Plots.resize(document.getElementById(`plotlyDiv${uniqueId}`));
        });
    }, []);
    const layout = React.useMemo(() => {
        if (!traces) {
            return null;
        }
        const layout = {
            showlegend: true,
            legend: {
                //@ts-ignore
                itemclick: false,
                itemdoubleclick: false
            },
            autosize: true,
            grid: { rows: traces.rows, columns: traces.cols, xgap: .3, pattern: 'independent' },
            shapes: [],
            violingap: 0,
        };
        return beautifyLayout(traces, layout);
    }, [traces]);
    return (React.createElement("div", { className: "d-flex flex-row w-100 h-100", style: { minHeight: '0px' } },
        React.createElement("div", { className: `position-relative d-flex justify-content-center align-items-center flex-grow-1 ${traceStatus === 'pending' ? 'tdp-busy-partial-overlay' : ''}` },
            mergedExtensions.prePlot,
            traceStatus === 'success' && (traces === null || traces === void 0 ? void 0 : traces.plots.length) > 0 ?
                React.createElement(PlotlyComponent, { divId: `plotlyDiv${uniqueId}`, data: [...traces.plots.map((p) => p.data), ...traces.legendPlots.map((p) => p.data)], layout: layout, config: { responsive: true, displayModeBar: false }, useResizeHandler: true, style: { width: '100%', height: '100%' }, 
                    // plotly redraws everything on updates, so you need to reappend title and
                    onUpdate: () => {
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
                    React.createElement(CategoricalColumnSelect, { callback: (catColumnsSelected) => setConfig({ ...config, catColumnsSelected }), columns: columns, currentSelected: config.catColumnsSelected || [] }),
                    React.createElement("hr", null),
                    mergedExtensions.preSidebar,
                    mergedOptionsConfig.overlay.enable ? mergedOptionsConfig.overlay.customComponent
                        || React.createElement(ViolinOverlayButtons, { callback: (violinOverlay) => setConfig({ ...config, violinOverlay }), currentSelected: config.violinOverlay }) : null,
                    mergedExtensions.postSidebar)))));
}
//# sourceMappingURL=ViolinVis.js.map