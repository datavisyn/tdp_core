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
import { getCssValue } from '../utils';
export function Vis({ columns, selected = {}, colors = [
    getCssValue('visyn-c1').slice(1),
    getCssValue('visyn-c2').slice(1),
    getCssValue('visyn-c3').slice(1),
    getCssValue('visyn-c4').slice(1),
    getCssValue('visyn-c5').slice(1),
    getCssValue('visyn-c6').slice(1),
    getCssValue('visyn-c7').slice(1),
    getCssValue('visyn-c8').slice(1),
    getCssValue('visyn-c9').slice(1),
    getCssValue('visyn-c10').slice(1),
], shapes = ['circle', 'square', 'triangle-up', 'star'], selectionCallback = () => null, filterCallback = () => null, }) {
    const [visConfig, setVisConfig] = useState({
        type: ESupportedPlotlyVis.SCATTER,
        numColumnsSelected: [],
        color: null,
        numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
        shape: null,
        isRectBrush: true,
        alphaSliderVal: 1,
    });
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
    const colorScale = useMemo(() => {
        return d3.scale.ordinal().range(colors);
    }, [visConfig]);
    const scales = useMemo(() => {
        return {
            color: colorScale,
        };
    }, [visConfig]);
    return (React.createElement(React.Fragment, null,
        isScatter(visConfig) ? (React.createElement(ScatterVis, { config: visConfig, optionsConfig: {
                color: {
                    enable: true,
                },
            }, shapes: shapes, setConfig: setVisConfig, filterCallback: filterCallback, selectionCallback: selectionCallback, selected: selected, columns: columns, scales: scales })) : null,
        isViolin(visConfig) ? (React.createElement(ViolinVis, { config: visConfig, optionsConfig: {
                overlay: {
                    enable: true,
                },
            }, setConfig: setVisConfig, columns: columns, scales: scales })) : null,
        isStrip(visConfig) ? React.createElement(StripVis, { config: visConfig, setConfig: setVisConfig, columns: columns, scales: scales }) : null,
        isPCP(visConfig) ? React.createElement(PCPVis, { config: visConfig, setConfig: setVisConfig, columns: columns }) : null,
        isBar(visConfig) ? React.createElement(BarVis, { config: visConfig, setConfig: setVisConfig, columns: columns, scales: scales }) : null));
}
//# sourceMappingURL=Vis.js.map