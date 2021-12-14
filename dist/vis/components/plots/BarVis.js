import * as React from 'react';
import { useMemo } from 'react';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { NumericalColumnSelect } from '../sidebar/NumericalColumnSelect';
import Plot from 'react-plotly.js';
import { InvalidCols } from '../InvalidCols';
import d3 from 'd3';
import { beautifyLayout } from '../../utils/layoutUtils';
import { merge } from 'lodash';
import { createBarTraces, EBarGroupingType } from '../../bar/bar';
import { GroupSelect } from '../sidebar/GroupSelect';
import { MultiplesSelect } from '../sidebar/MultiplesSelect';
import { BarDirectionButtons } from '../sidebar/BarDirectionButtons';
import { BarGroupTypeButtons } from '../sidebar/BarGroupTypeButtons';
import { BarDisplayButtons } from '../sidebar/BarDisplayTypeButtons';
import { CategoricalColumnSelect } from '../sidebar/CategoricalColumnSelect';
const defaultConfig = {
    group: {
        enable: true,
        customComponent: null,
    },
    multiples: {
        enable: true,
        customComponent: null,
    },
    direction: {
        enable: true,
        customComponent: null,
    },
    groupType: {
        enable: true,
        customComponent: null,
    },
    display: {
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
export function BarVis({ config, optionsConfig, extensions, columns, setConfig, scales }) {
    const mergedOptionsConfig = useMemo(() => {
        return merge(defaultConfig, optionsConfig);
    }, []);
    const mergedExtensions = useMemo(() => {
        return merge(defaultExtensions, extensions);
    }, []);
    const traces = useMemo(() => {
        return createBarTraces(columns, config, scales);
    }, [columns, config, scales]);
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
            barmode: config.groupType === EBarGroupingType.STACK ? 'stack' : 'group'
        };
        return beautifyLayout(traces, layout);
    }, [traces, config.groupType]);
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
                    mergedOptionsConfig.group.enable ? mergedOptionsConfig.group.customComponent
                        || React.createElement(GroupSelect, { callback: (group) => setConfig({ ...config, group }), columns: columns, currentSelected: config.group }) : null,
                    mergedOptionsConfig.multiples.enable ? mergedOptionsConfig.multiples.customComponent
                        || React.createElement(MultiplesSelect, { callback: (multiples) => setConfig({ ...config, multiples }), columns: columns, currentSelected: config.multiples }) : null,
                    React.createElement("hr", null),
                    mergedOptionsConfig.direction.enable ? mergedOptionsConfig.direction.customComponent
                        || React.createElement(BarDirectionButtons, { callback: (direction) => setConfig({ ...config, direction }), currentSelected: config.direction }) : null,
                    mergedOptionsConfig.groupType.enable ? mergedOptionsConfig.groupType.customComponent
                        || React.createElement(BarGroupTypeButtons, { callback: (groupType) => setConfig({ ...config, groupType }), currentSelected: config.groupType }) : null,
                    mergedOptionsConfig.display.enable ? mergedOptionsConfig.display.customComponent
                        || React.createElement(BarDisplayButtons, { callback: (display) => setConfig({ ...config, display }), currentSelected: config.display }) : null,
                    mergedExtensions.postSidebar)))));
}
//# sourceMappingURL=BarVis.js.map