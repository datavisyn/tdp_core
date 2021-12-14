import * as React from 'react';
import { useMemo } from 'react';
import { VisTypeSelect } from '../sidebarComponents/VisTypeSelect';
import { NumericalColumnSelect } from '../sidebarComponents/NumericalColumnSelect';
import Plot from 'react-plotly.js';
import { InvalidCols } from '../InvalidCols';
import d3 from 'd3';
import { beautifyLayout } from '../../utils/layoutUtils';
import { createViolinTraces } from '../../traces/violin';
import { CategoricalColumnSelect } from '../sidebarComponents/CategoricalColumnSelect';
import { ViolinOverlayButtons } from '../sidebarComponents/ViolinOverlayButtons';
export function ViolinVis(props) {
    const traces = useMemo(() => {
        return createViolinTraces(props.columns, props.config, props.scales);
    }, [props.columns, props.config, props.scales]);
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
        };
        return beautifyLayout(traces, layout);
    }, [traces]);
    return (React.createElement("div", { className: "d-flex flex-row w-100 h-100" },
        React.createElement("div", { className: "position-relative d-flex justify-content-center align-items-center flex-grow-1" }, traces.plots.length > 0 ?
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
                } })) : (React.createElement(InvalidCols, { message: traces.errorMessage }))),
        React.createElement("div", { className: "position-relative h-100 flex-shrink-1 bg-light" },
            React.createElement("button", { className: "btn btn-primary-outline", type: "button", "data-bs-toggle": "collapse", "data-bs-target": "#generalVisBurgerMenu", "aria-expanded": "true", "aria-controls": "generalVisBurgerMenu" },
                React.createElement("i", { className: "fas fa-bars" })),
            React.createElement("div", { className: "collapse show collapse-horizontal", id: "generalVisBurgerMenu" },
                React.createElement("div", { className: "container", style: { width: '20rem' } },
                    React.createElement(VisTypeSelect, { callback: (type) => props.setConfig({ ...props.config, type }), currentSelected: props.config.type }),
                    React.createElement("hr", null),
                    React.createElement(NumericalColumnSelect, { callback: (numColumnsSelected) => props.setConfig({ ...props.config, numColumnsSelected }), columns: props.columns, currentSelected: props.config.numColumnsSelected }),
                    React.createElement(CategoricalColumnSelect, { callback: (catColumnsSelected) => props.setConfig({ ...props.config, catColumnsSelected }), columns: props.columns, currentSelected: props.config.catColumnsSelected }),
                    React.createElement("hr", null),
                    React.createElement(ViolinOverlayButtons, { callback: (violinOverlay) => props.setConfig({ ...props.config, violinOverlay }) }))))));
}
//# sourceMappingURL=ViolinVis.js.map