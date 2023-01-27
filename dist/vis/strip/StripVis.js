import * as React from 'react';
import * as d3v7 from 'd3v7';
import { merge, uniqueId } from 'lodash';
import { useMemo, useEffect, useState } from 'react';
import { ActionIcon, Container, Space, Tooltip } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { PlotlyComponent, Plotly } from '../Plot';
import { InvalidCols } from '../general';
import { beautifyLayout } from '../general/layoutUtils';
import { createStripTraces } from './utils';
import { useAsync } from '../../hooks';
import { StripVisSidebar } from './StripVisSidebar';
import { VisSidebarWrapper } from '../VisSidebarWrapper';
import { CloseButton } from '../sidebar/CloseButton';
import { I18nextManager } from '../../i18n';
const defaultExtensions = {
    prePlot: null,
    postPlot: null,
    preSidebar: null,
    postSidebar: null,
};
export function StripVis({ config, extensions, columns, setConfig, selectionCallback = () => null, selected = {}, scales, hideSidebar = false, showCloseButton = false, closeButtonCallback = () => null, }) {
    const mergedExtensions = useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, [extensions]);
    const { value: traces, status: traceStatus, error: traceError } = useAsync(createStripTraces, [columns, config, selected, scales]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const id = React.useMemo(() => uniqueId('StripVis'), []);
    const plotlyDivRef = React.useRef(null);
    useEffect(() => {
        const ro = new ResizeObserver(() => {
            Plotly.Plots.resize(document.getElementById(`plotlyDiv${id}`));
        });
        if (plotlyDivRef) {
            ro.observe(plotlyDivRef.current);
        }
    }, [id, plotlyDivRef]);
    const layout = React.useMemo(() => {
        if (!traces) {
            return null;
        }
        const innerLayout = {
            showlegend: true,
            legend: {
                // @ts-ignore
                itemclick: false,
                itemdoubleclick: false,
            },
            margin: {
                t: 25,
                r: 25,
                l: 25,
                b: 25,
            },
            font: {
                family: 'Roboto, sans-serif',
            },
            autosize: true,
            grid: { rows: traces.rows, columns: traces.cols, xgap: 0.3, pattern: 'independent' },
            shapes: [],
            dragmode: 'select',
        };
        return beautifyLayout(traces, innerLayout);
    }, [traces]);
    return (React.createElement(Container, { fluid: true, sx: { flexGrow: 1, height: '100%', width: '100%', position: 'relative' }, ref: plotlyDivRef },
        React.createElement(Space, { h: "xl" }),
        showCloseButton ? React.createElement(CloseButton, { closeCallback: closeButtonCallback }) : null,
        React.createElement(Tooltip, { withinPortal: true, label: I18nextManager.getInstance().i18n.t('tdp:core.vis.openSettings') },
            React.createElement(ActionIcon, { sx: { zIndex: 10, position: 'absolute', top: '10px', right: '10px' }, onClick: () => setSidebarOpen(true) },
                React.createElement(FontAwesomeIcon, { icon: faGear }))),
        mergedExtensions.prePlot,
        traceStatus === 'success' && traces?.plots.length > 0 ? (React.createElement(PlotlyComponent, { divId: `plotlyDiv${id}`, data: [...traces.plots.map((p) => p.data), ...traces.legendPlots.map((p) => p.data)], layout: layout, config: { responsive: true, displayModeBar: false }, useResizeHandler: true, style: { width: '100%', height: '100%' }, className: "tdpCoreVis", onSelected: (sel) => {
                selectionCallback(sel ? sel.points.map((d) => d.id) : []);
            }, 
            // plotly redraws everything on updates, so you need to reappend title and
            onUpdate: () => {
                for (const p of traces.plots) {
                    d3v7.select(`g .${p.data.xaxis}title`).style('pointer-events', 'all').append('title').text(p.xLabel);
                    d3v7.select(`g .${p.data.yaxis}title`).style('pointer-events', 'all').append('title').text(p.yLabel);
                }
            } })) : traceStatus !== 'pending' ? (React.createElement(InvalidCols, { headerMessage: traces?.errorMessageHeader, bodyMessage: traceError?.message || traces?.errorMessage })) : null,
        mergedExtensions.postPlot,
        !hideSidebar ? (React.createElement(VisSidebarWrapper, { id: id, target: plotlyDivRef.current, open: sidebarOpen, onClose: () => setSidebarOpen(false) },
            React.createElement(StripVisSidebar, { config: config, extensions: extensions, columns: columns, setConfig: setConfig }))) : null));
}
//# sourceMappingURL=StripVis.js.map