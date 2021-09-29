import d3 from 'd3';
import * as React from 'react';
import { useMemo, useState } from 'react';
import { barMergeDefaultConfig, isBar } from './bar/utils';
import { ENumericalColorScaleType, isScatter, scatterMergeDefaultConfig } from './scatter/utils';
import { ESupportedPlotlyVis } from './interfaces';
import { ScatterVis } from './scatter/ScatterVis';
import { ViolinVis } from './violin/ViolinVis';
import { isViolin, violinMergeDefaultConfig } from './violin/utils';
import { isStrip, stripMergeDefaultConfig } from './strip/utils';
import { StripVis } from './strip/StripVis';
import { isPCP, pcpMergeDefaultConfig } from './pcp/utils';
import { PCPVis } from './pcp/PCPVis';
import { BarVis } from './bar/BarVis';
export function Vis({ columns, selected = {}, colors = ['#337ab7', '#ec6836', '#75c4c2', '#e9d36c', '#24b466', '#e891ae', '#db933c', '#b08aa6', '#8a6044', '#7b7b7b'], shapes = ['circle', 'square', 'triangle-up', 'star'], selectionCallback = () => null, filterCallback = () => null }) {
    const [visConfig, setVisConfig] = useState({
        type: ESupportedPlotlyVis.SCATTER,
        numColumnsSelected: [],
        color: null,
        numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
        shape: null,
        isRectBrush: true,
        alphaSliderVal: 1
    });
    useMemo(() => {
        if (isScatter(visConfig)) {
            setVisConfig(scatterMergeDefaultConfig(columns, visConfig));
        }
        if (isViolin(visConfig)) {
            setVisConfig(violinMergeDefaultConfig(columns, visConfig));
        }
        if (isStrip(visConfig)) {
            setVisConfig(stripMergeDefaultConfig(columns, visConfig));
        }
        if (isPCP(visConfig)) {
            setVisConfig(pcpMergeDefaultConfig(columns, visConfig));
        }
        if (isBar(visConfig)) {
            setVisConfig(barMergeDefaultConfig(columns, visConfig));
        }
    }, [visConfig.type]);
    const colorScale = useMemo(() => {
        return d3.scale.ordinal().range(colors);
    }, [visConfig]);
    const scales = useMemo(() => {
        return {
            color: colorScale
        };
    }, [visConfig]);
    return (React.createElement(React.Fragment, null,
        isScatter(visConfig) ?
            React.createElement(ScatterVis, { config: visConfig, optionsConfig: {
                    color: {
                        enable: true,
                    }
                }, shapes: shapes, setConfig: setVisConfig, filterCallback: filterCallback, selectionCallback: selectionCallback, selected: selected, columns: columns, scales: scales }) : null,
        isViolin(visConfig) ?
            React.createElement(ViolinVis, { config: visConfig, optionsConfig: {
                    overlay: {
                        enable: true,
                    }
                }, setConfig: setVisConfig, columns: columns, scales: scales }) : null,
        isStrip(visConfig) ?
            React.createElement(StripVis, { config: visConfig, setConfig: setVisConfig, columns: columns, scales: scales }) : null,
        isPCP(visConfig) ?
            React.createElement(PCPVis, { config: visConfig, setConfig: setVisConfig, columns: columns }) : null,
        isBar(visConfig) ?
            React.createElement(BarVis, { config: visConfig, setConfig: setVisConfig, columns: columns, scales: scales }) : null));
}
//# sourceMappingURL=Vis.js.map