import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { NumericalColumnSelect } from '../sidebar/NumericalColumnSelect';
import Plot from 'react-plotly.js';
import { InvalidCols } from '../InvalidCols';
import d3 from 'd3';
import { beautifyLayout } from '../layoutUtils';
import { CategoricalColumnSelect } from '../sidebar/CategoricalColumnSelect';
import { merge } from 'lodash';
import { createStripTraces } from './utils';
import { WarningMessage } from '../sidebar/WarningMessage';
import Plotly from 'plotly.js';
import { useAsync } from '../..';
const defaultConfig = {};
const defaultExtensions = {
    prePlot: null,
    postPlot: null,
    preSidebar: null,
    postSidebar: null
};
export function StripVis({ config, optionsConfig, extensions, columns, setConfig, scales }) {
    const mergedOptionsConfig = useMemo(() => {
        return merge({}, defaultConfig, optionsConfig);
    }, []);
    const mergedExtensions = useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, []);
    const { value: traces, status: traceStatus, error: traceError } = useAsync(createStripTraces, [columns, config, scales]);
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
        };
        return beautifyLayout(traces, layout);
    }, [traces]);
    return (React.createElement("div", { className: "d-flex flex-row w-100 h-100", style: { minHeight: '0px' } },
        React.createElement("div", { className: `position-relative d-flex justify-content-center align-items-center flex-grow-1 ${traceStatus === 'pending' ? 'tdp-busy-partial-overlay' : ''}` },
            mergedExtensions.prePlot,
            traceStatus === 'success' && (traces === null || traces === void 0 ? void 0 : traces.plots.length) > 0 ?
                React.createElement(Plot, { divId: `plotlyDiv${uniqueId}`, data: [...traces.plots.map((p) => p.data), ...traces.legendPlots.map((p) => p.data)], layout: layout, config: { responsive: true, displayModeBar: false }, useResizeHandler: true, style: { width: '100%', height: '100%' }, 
                    //plotly redraws everything on updates, so you need to reappend title and
                    // change opacity on update, instead of just in a use effect
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
                    mergedExtensions.postSidebar)))));
}
//# sourceMappingURL=StripVis.js.map