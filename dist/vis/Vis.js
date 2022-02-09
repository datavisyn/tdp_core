/* eslint-disable react-hooks/exhaustive-deps */
import d3 from 'd3';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { barMergeDefaultConfig, isBar } from './bar/utils';
import { isScatter, scatterMergeDefaultConfig } from './scatter/utils';
import { ENumericalColorScaleType, ESupportedPlotlyVis } from './interfaces';
import { ScatterVis } from './scatter/ScatterVis';
import { ViolinVis } from './violin/ViolinVis';
import { isViolin, violinMergeDefaultConfig } from './violin/utils';
import { isStrip, stripMergeDefaultConfig } from './strip/utils';
import { StripVis } from './strip/StripVis';
import { isPCP, pcpMergeDefaultConfig } from './pcp/utils';
import { PCPVis } from './pcp/PCPVis';
import { BarVis } from './bar/BarVis';
import { getCssValue } from '../utils/getCssValue';
export function Vis({ columns, selected = {}, colors = [getCssValue('visyn-c1'),
    getCssValue('visyn-c2'),
    getCssValue('visyn-c3'),
    getCssValue('visyn-c4'),
    getCssValue('visyn-c5'),
    getCssValue('visyn-c6'),
    getCssValue('visyn-c7'),
    getCssValue('visyn-c8'),
    getCssValue('visyn-c9'),
    getCssValue('visyn-c10')], shapes = ['circle', 'square', 'triangle-up', 'star'], selectionCallback = () => null, filterCallback = () => null, externalConfig = null, hideSidebar = false }) {
    const [visConfig, setVisConfig] = useState(externalConfig ? externalConfig : {
        type: ESupportedPlotlyVis.SCATTER,
        numColumnsSelected: [],
        color: null,
        numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
        shape: null,
        isRectBrush: true,
        alphaSliderVal: 1
    });
    useEffect(() => {
        setVisConfig(externalConfig);
    }, [externalConfig]);
    useEffect(() => {
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
    const scales = useMemo(() => {
        let colorScale = d3.scale.ordinal().range(colors);
        return {
            color: colorScale,
        };
    }, [visConfig]);
    return (React.createElement(React.Fragment, null,
        isScatter(visConfig) ?
            React.createElement(ScatterVis, { config: visConfig, optionsConfig: {
                    color: {
                        enable: true,
                    }
                }, shapes: shapes, setConfig: setVisConfig, filterCallback: filterCallback, selectionCallback: selectionCallback, selected: selected, columns: columns, scales: scales, hideSidebar: hideSidebar }) : null,
        isViolin(visConfig) ?
            React.createElement(ViolinVis, { config: visConfig, optionsConfig: {
                    overlay: {
                        enable: true,
                    }
                }, setConfig: setVisConfig, columns: columns, scales: scales, hideSidebar: hideSidebar }) : null,
        isStrip(visConfig) ?
            React.createElement(StripVis, { config: visConfig, setConfig: setVisConfig, columns: columns, scales: scales, hideSidebar: hideSidebar }) : null,
        isPCP(visConfig) ?
            React.createElement(PCPVis, { config: visConfig, setConfig: setVisConfig, columns: columns, hideSidebar: hideSidebar }) : null,
        isBar(visConfig) ?
            React.createElement(BarVis, { config: visConfig, setConfig: setVisConfig, columns: columns, scales: scales, hideSidebar: hideSidebar }) : null));
}
//# sourceMappingURL=Vis.js.map