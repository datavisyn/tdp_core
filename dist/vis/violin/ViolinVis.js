/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';
import { useEffect, useMemo } from 'react';
import Plot from 'react-plotly.js';
import d3 from 'd3';
import { merge } from 'lodash';
import Plotly from 'plotly.js';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { NumericalColumnSelect } from '../sidebar/NumericalColumnSelect';
import { InvalidCols } from '../InvalidCols';
import { beautifyLayout } from '../layoutUtils';
import { createViolinTraces } from './utils';
import { CategoricalColumnSelect } from '../sidebar/CategoricalColumnSelect';
import { ViolinOverlayButtons } from '../sidebar/ViolinOverlayButtons';
import { WarningMessage } from '../sidebar/WarningMessage';
const defaultConfig = {
    overlay: {
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
export function ViolinVis({ config, optionsConfig, extensions, columns, setConfig, scales }) {
    const mergedOptionsConfig = useMemo(() => {
        return merge({}, defaultConfig, optionsConfig);
    }, []);
    const mergedExtensions = useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, []);
    const traces = useMemo(() => {
        return createViolinTraces(columns, config, scales);
    }, [columns, config, scales]);
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
        const scopedLayout = {
            showlegend: true,
            legend: {
                itemclick: false,
                itemdoubleclick: false,
            },
            autosize: true,
            grid: { rows: traces.rows, columns: traces.cols, xgap: 0.3, pattern: 'independent' },
            shapes: [],
            violingap: 0,
        };
        return beautifyLayout(traces, scopedLayout);
    }, [traces]);
    return (React.createElement("div", { className: "d-flex flex-row w-100 h-100", style: { minHeight: '0px' } },
        React.createElement("div", { className: "position-relative d-flex justify-content-center align-items-center flex-grow-1" },
            mergedExtensions.prePlot,
            traces.plots.length > 0 ? (React.createElement(Plot, { divId: `plotlyDiv${uniqueId}`, data: [...traces.plots.map((p) => p.data), ...traces.legendPlots.map((p) => p.data)], layout: layout, config: { responsive: true, displayModeBar: false }, useResizeHandler: true, style: { width: '100%', height: '100%' }, 
                // plotly redraws everything on updates, so you need to reappend title and
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
                    mergedOptionsConfig.overlay.enable
                        ? mergedOptionsConfig.overlay.customComponent || (React.createElement(ViolinOverlayButtons, { callback: (violinOverlay) => setConfig({ ...config, violinOverlay }), currentSelected: config.violinOverlay }))
                        : null,
                    mergedExtensions.postSidebar)))));
}
//# sourceMappingURL=ViolinVis.js.map