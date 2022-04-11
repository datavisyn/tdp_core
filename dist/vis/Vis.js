import * as React from 'react';
import d3 from 'd3';
import { useMemo, useEffect } from 'react';
import { ESupportedPlotlyVis, ENumericalColorScaleType, EColumnTypes, EBarDirection, EBarDisplayType, EBarGroupingType, EScatterSelectSettings, } from './interfaces';
import { isScatter, scatterMergeDefaultConfig, ScatterVis } from './scatter';
import { barMergeDefaultConfig, isBar, BarVis } from './bar';
import { isViolin, violinMergeDefaultConfig, ViolinVis } from './violin';
import { isStrip, stripMergeDefaultConfig, StripVis } from './strip';
import { isPCP, pcpMergeDefaultConfig, PCPVis } from './pcp';
import { getCssValue } from '../utils';
export function Vis({ columns, selected = [], colors = [
    getCssValue('visyn-c1'),
    getCssValue('visyn-c2'),
    getCssValue('visyn-c3'),
    getCssValue('visyn-c4'),
    getCssValue('visyn-c5'),
    getCssValue('visyn-c6'),
    getCssValue('visyn-c7'),
    getCssValue('visyn-c8'),
    getCssValue('visyn-c9'),
    getCssValue('visyn-c10'),
], shapes = ['circle', 'square', 'triangle-up', 'star'], selectionCallback = () => null, filterCallback = () => null, externalConfig = null, hideSidebar = false, }) {
    const [visConfig, setVisConfig] = React.useState(externalConfig || columns.filter((c) => c.type === EColumnTypes.NUMERICAL).length > 1
        ? {
            type: ESupportedPlotlyVis.SCATTER,
            numColumnsSelected: [],
            color: null,
            numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
            shape: null,
            dragMode: EScatterSelectSettings.RECTANGLE,
            alphaSliderVal: 0.5,
        }
        : {
            type: ESupportedPlotlyVis.BAR,
            multiples: null,
            group: null,
            direction: EBarDirection.VERTICAL,
            display: EBarDisplayType.ABSOLUTE,
            groupType: EBarGroupingType.STACK,
            numColumnsSelected: [],
            catColumnSelected: null,
        });
    React.useEffect(() => {
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
        // DANGER:: this useEffect should only occur when the visConfig.type changes. adding visconfig into the dep array will cause an infinite loop.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visConfig.type]);
    useEffect(() => {
        if (externalConfig) {
            setVisConfig(externalConfig);
        }
    }, [externalConfig]);
    const selectedMap = useMemo(() => {
        const currMap = {};
        selected.forEach((s) => {
            currMap[s] = true;
        });
        return currMap;
    }, [selected]);
    const scales = useMemo(() => {
        const colorScale = d3.scale.ordinal().range(colors);
        return {
            color: colorScale,
        };
    }, [colors]);
    return (React.createElement(React.Fragment, null,
        isScatter(visConfig) ? (React.createElement(ScatterVis, { config: visConfig, optionsConfig: {
                color: {
                    enable: true,
                },
            }, shapes: shapes, setConfig: setVisConfig, filterCallback: filterCallback, selectionCallback: selectionCallback, selectedMap: selectedMap, selectedList: selected, columns: columns, scales: scales, hideSidebar: hideSidebar })) : null,
        isViolin(visConfig) ? (React.createElement(ViolinVis, { config: visConfig, optionsConfig: {
                overlay: {
                    enable: true,
                },
            }, setConfig: setVisConfig, columns: columns, scales: scales, hideSidebar: hideSidebar })) : null,
        isStrip(visConfig) ? (React.createElement(StripVis, { config: visConfig, selectionCallback: selectionCallback, setConfig: setVisConfig, selected: selectedMap, columns: columns, scales: scales, hideSidebar: hideSidebar })) : null,
        isPCP(visConfig) ? React.createElement(PCPVis, { config: visConfig, selected: selectedMap, setConfig: setVisConfig, columns: columns, hideSidebar: hideSidebar }) : null,
        isBar(visConfig) ? React.createElement(BarVis, { config: visConfig, setConfig: setVisConfig, columns: columns, scales: scales, hideSidebar: hideSidebar }) : null));
}
//# sourceMappingURL=Vis.js.map