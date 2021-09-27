import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { NumericalColumnSelect } from '../sidebar/NumericalColumnSelect';
import Plot from 'react-plotly.js';
import { InvalidCols } from '../InvalidCols';
import d3 from 'd3';
import { CategoricalColumnSelect } from '../sidebar/CategoricalColumnSelect';
import { merge } from 'lodash';
import { createPCPTraces, pcpInit } from '../../plotUtils/pcp';
const defaultConfig = {};
const defaultExtensions = {
    prePlot: null,
    postPlot: null,
    preSidebar: null,
    postSidebar: null
};
export function PCPVis({ config, optionsConfig, extensions, columns, setConfig, }) {
    const mergedOptionsConfig = useMemo(() => {
        return merge(defaultConfig, optionsConfig);
    }, []);
    const mergedExtensions = useMemo(() => {
        return merge(defaultExtensions, extensions);
    }, []);
    useEffect(() => {
        pcpInit(columns, config, setConfig);
    }, []);
    const traces = useMemo(() => {
        return createPCPTraces(columns, config);
    }, [columns, config]);
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
    return (React.createElement("div", { className: "d-flex flex-row w-100 h-100" },
        React.createElement("div", { className: "position-relative d-flex justify-content-center align-items-center flex-grow-1" },
            mergedExtensions.prePlot,
            traces.plots.length > 0 ?
                (React.createElement(Plot, { divId: 'plotlyDiv', data: [...traces.plots.map((p) => p.data), ...traces.legendPlots.map((p) => p.data)], layout: layout, config: { responsive: true, displayModeBar: false }, useResizeHandler: true, style: { width: '100%', height: '100%' }, 
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
        React.createElement("div", { className: "position-relative h-100 flex-shrink-1 bg-light" },
            React.createElement("button", { className: "btn btn-primary-outline", type: "button", "data-bs-toggle": "collapse", "data-bs-target": "#generalVisBurgerMenu", "aria-expanded": "true", "aria-controls": "generalVisBurgerMenu" },
                React.createElement("i", { className: "fas fa-bars" })),
            React.createElement("div", { className: "collapse show collapse-horizontal", id: "generalVisBurgerMenu" },
                React.createElement("div", { className: "container", style: { width: '20rem' } },
                    React.createElement(VisTypeSelect, { callback: (type) => setConfig({ ...config, type }), currentSelected: config.type }),
                    React.createElement("hr", null),
                    React.createElement(NumericalColumnSelect, { callback: (numColumnsSelected) => setConfig({ ...config, numColumnsSelected }), columns: columns, currentSelected: config.numColumnsSelected || [] }),
                    React.createElement(CategoricalColumnSelect, { callback: (catColumnsSelected) => setConfig({ ...config, catColumnsSelected }), columns: columns, currentSelected: config.catColumnsSelected || [] }),
                    React.createElement("hr", null),
                    mergedExtensions.preSidebar,
                    mergedExtensions.postSidebar)))));
}
//# sourceMappingURL=PCPVis.js.map