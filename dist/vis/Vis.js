import * as React from 'react';
import d3 from 'd3';
import { ESupportedPlotlyVis, ENumericalColorScaleType } from './interfaces';
import { isScatter, scatterMergeDefaultConfig, ScatterVis } from './scatter';
import { barMergeDefaultConfig, isBar, BarVis } from './bar';
import { isViolin, violinMergeDefaultConfig, ViolinVis } from './violin';
import { isStrip, stripMergeDefaultConfig, StripVis } from './strip';
import { isPCP, pcpMergeDefaultConfig, PCPVis } from './pcp';
import { getCssValue } from '../utils';
export function Vis({ columns, selected = {}, colors = [
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
], shapes = ['circle', 'square', 'triangle-up', 'star'], selectionCallback = () => null, filterCallback = () => null, }) {
    const [visConfig, setVisConfig] = React.useState({
        type: ESupportedPlotlyVis.SCATTER,
        numColumnsSelected: [],
        color: null,
        numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
        shape: null,
        isRectBrush: true,
        alphaSliderVal: 1,
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visConfig.type]);
    const scales = React.useMemo(() => {
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