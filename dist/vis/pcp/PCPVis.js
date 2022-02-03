import * as React from 'react';
import { useEffect, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { InvalidCols } from '../InvalidCols';
import d3 from 'd3';
import { merge } from 'lodash';
import { createPCPTraces } from './utils';
import Plotly from 'plotly.js';
import { PCPVisSidebar } from './PCPVisSidebar';
const defaultConfig = {};
const defaultExtensions = {
    prePlot: null,
    postPlot: null,
    preSidebar: null,
    postSidebar: null
};
export function PCPVis({ config, optionsConfig, extensions, columns, setConfig, hideSidebar = false }) {
    const mergedOptionsConfig = useMemo(() => {
        return merge({}, defaultConfig, optionsConfig);
    }, []);
    const mergedExtensions = useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, []);
    const traces = useMemo(() => {
        return createPCPTraces(columns, config);
    }, [columns, config]);
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
        return {
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
    }, [traces]);
    return (React.createElement("div", { className: "d-flex flex-row w-100 h-100", style: { minHeight: '0px' } },
        React.createElement("div", { className: "position-relative d-flex justify-content-center align-items-center flex-grow-1" },
            mergedExtensions.prePlot,
            traces.plots.length > 0 ?
                (React.createElement(Plot, { divId: `plotlyDiv${uniqueId}`, data: [...traces.plots.map((p) => p.data), ...traces.legendPlots.map((p) => p.data)], layout: layout, config: { responsive: true, displayModeBar: false }, useResizeHandler: true, style: { width: '100%', height: '100%' }, 
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
                    } })) : (React.createElement(InvalidCols, { message: traces.errorMessage })),
            mergedExtensions.postPlot),
        !hideSidebar ?
            React.createElement("div", { className: "position-relative h-100 flex-shrink-1 bg-light overflow-auto mt-2" },
                React.createElement("button", { className: "btn btn-primary-outline", type: "button", "data-bs-toggle": "collapse", "data-bs-target": `#generalVisBurgerMenu${uniqueId}`, "aria-expanded": "true", "aria-controls": "generalVisBurgerMenu" },
                    React.createElement("i", { className: "fas fa-bars" })),
                React.createElement("div", { className: "collapse show collapse-horizontal", id: `generalVisBurgerMenu${uniqueId}` },
                    React.createElement(PCPVisSidebar, { config: config, optionsConfig: optionsConfig, extensions: extensions, columns: columns, setConfig: setConfig }))) : null));
}
//# sourceMappingURL=PCPVis.js.map