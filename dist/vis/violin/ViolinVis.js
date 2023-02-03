import * as React from 'react';
import d3v3 from 'd3v3';
import { merge, uniqueId } from 'lodash';
import { useEffect, useState } from 'react';
import { ActionIcon, Container, Space, Tooltip } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { PlotlyComponent, Plotly } from '../Plot';
import { InvalidCols } from '../general';
import { beautifyLayout } from '../general/layoutUtils';
import { createViolinTraces } from './utils';
import { useAsync } from '../../hooks';
import { ViolinVisSidebar } from './ViolinVisSidebar';
import { VisSidebarWrapper } from '../VisSidebarWrapper';
import { CloseButton } from '../sidebar/CloseButton';
import { I18nextManager } from '../../i18n';
const defaultExtensions = {
    prePlot: null,
    postPlot: null,
    preSidebar: null,
    postSidebar: null,
};
export function ViolinVis({ config, optionsConfig, extensions, columns, setConfig, scales, hideSidebar = false, showCloseButton = false, closeButtonCallback = () => null, }) {
    const mergedExtensions = React.useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, [extensions]);
    const { value: traces, status: traceStatus, error: traceError } = useAsync(createViolinTraces, [columns, config, scales]);
    const id = React.useMemo(() => uniqueId('ViolinVis'), []);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [layout, setLayout] = useState(null);
    const plotlyDivRef = React.useRef(null);
    useEffect(() => {
        const ro = new ResizeObserver(() => {
            Plotly.Plots.resize(document.getElementById(`plotlyDiv${id}`));
        });
        if (plotlyDivRef) {
            ro.observe(plotlyDivRef.current);
        }
        return () => ro.disconnect();
    }, [id, plotlyDivRef]);
    React.useEffect(() => {
        if (!traces) {
            return;
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
        };
        setLayout({ ...layout, ...beautifyLayout(traces, innerLayout, layout) });
        // WARNING: Do not update when layout changes, that would be an infinite loop.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [traces]);
    return (React.createElement(Container, { fluid: true, sx: { flexGrow: 1, height: '100%', width: '100%', position: 'relative' }, ref: plotlyDivRef },
        React.createElement(Space, { h: "xl" }),
        showCloseButton ? React.createElement(CloseButton, { closeCallback: closeButtonCallback }) : null,
        React.createElement(Tooltip, { withinPortal: true, label: I18nextManager.getInstance().i18n.t('tdp:core.vis.openSettings') },
            React.createElement(ActionIcon, { sx: { zIndex: 10, position: 'absolute', top: '10px', right: '10px' }, onClick: () => setSidebarOpen(true) },
                React.createElement(FontAwesomeIcon, { icon: faGear }))),
        mergedExtensions.prePlot,
        traceStatus === 'success' && layout && traces?.plots.length > 0 ? (React.createElement(PlotlyComponent, { divId: `plotlyDiv${id}`, className: "tdpCoreVis", data: [...traces.plots.map((p) => p.data), ...traces.legendPlots.map((p) => p.data)], layout: layout, config: { responsive: true, displayModeBar: false }, useResizeHandler: true, style: { width: '100%', height: '100%' }, 
            // plotly redraws everything on updates, so you need to reappend title and
            onUpdate: () => {
                for (const p of traces.plots) {
                    d3v3.select(`g .${p.data.xaxis}title`).style('pointer-events', 'all').append('title').text(p.xLabel);
                    d3v3.select(`g .${p.data.yaxis}title`).style('pointer-events', 'all').append('title').text(p.yLabel);
                }
            } })) : traceStatus !== 'pending' ? (React.createElement(InvalidCols, { headerMessage: traces?.errorMessageHeader, bodyMessage: traceError?.message || traces?.errorMessage })) : null,
        mergedExtensions.postPlot,
        !hideSidebar ? (React.createElement(VisSidebarWrapper, { id: id, target: plotlyDivRef.current, open: sidebarOpen, onClose: () => setSidebarOpen(false) },
            React.createElement(ViolinVisSidebar, { config: config, optionsConfig: optionsConfig, extensions: extensions, columns: columns, setConfig: setConfig }))) : null));
}
//# sourceMappingURL=ViolinVis.js.map