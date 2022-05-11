import * as React from 'react';
import { useEffect, useState } from 'react';
import { barMergeDefaultConfig, isBar } from './bar/utils';
import { isScatter, scatterMergeDefaultConfig } from './scatter/utils';
import { ESupportedPlotlyVis, ENumericalColorScaleType, EScatterSelectSettings } from './interfaces';
import { isViolin, violinMergeDefaultConfig } from './violin/utils';
import { isStrip, stripMergeDefaultConfig } from './strip/utils';
import { isPCP, pcpMergeDefaultConfig } from './pcp/utils';
import { PCPVisSidebar } from './pcp/PCPVisSidebar';
import { BarVisSidebar } from './bar/BarVisSidebar';
import { StripVisSidebar } from './strip/StripVisSidebar';
import { ViolinVisSidebar } from './violin/ViolinVisSidebar';
import { ScatterVisSidebar } from './scatter/ScatterVisSidebar';
import { useSyncedRef } from '../hooks';
import { isSankey, sankeyMergeDefaultConfig } from './sankey';
import { SankeyVisSidebar } from './sankey/SankeyVisSidebar';
export function VisSidebar({ columns, filterCallback = () => null, externalConfig = null, setExternalConfig = null, className, style }) {
    const [visConfig, setVisConfig] = useState(externalConfig || {
        type: ESupportedPlotlyVis.SCATTER,
        numColumnsSelected: [],
        color: null,
        numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
        shape: null,
        dragMode: EScatterSelectSettings.RECTANGLE,
        alphaSliderVal: 1,
    });
    const setExternalConfigRef = useSyncedRef(setExternalConfig);
    useEffect(() => {
        var _a;
        (_a = setExternalConfigRef.current) === null || _a === void 0 ? void 0 : _a.call(setExternalConfigRef, visConfig);
    }, [visConfig, setExternalConfigRef]);
    useEffect(() => {
        if (isSankey(visConfig)) {
            setVisConfig(sankeyMergeDefaultConfig(columns, visConfig));
        }
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
    return (React.createElement(React.Fragment, null,
        isSankey(visConfig) ? React.createElement(SankeyVisSidebar, { config: visConfig, setConfig: setVisConfig, className: className, style: style, columns: columns }) : null,
        isScatter(visConfig) ? (React.createElement(ScatterVisSidebar, { config: visConfig, optionsConfig: {
                color: {
                    enable: true,
                },
            }, setConfig: setVisConfig, filterCallback: filterCallback, columns: columns, className: className, style: style })) : null,
        isViolin(visConfig) ? (React.createElement(ViolinVisSidebar, { config: visConfig, optionsConfig: {
                overlay: {
                    enable: true,
                },
            }, setConfig: setVisConfig, columns: columns, className: className, style: style })) : null,
        isStrip(visConfig) ? React.createElement(StripVisSidebar, { config: visConfig, setConfig: setVisConfig, columns: columns, className: className, style: style }) : null,
        isPCP(visConfig) ? React.createElement(PCPVisSidebar, { config: visConfig, setConfig: setVisConfig, columns: columns, className: className, style: style }) : null,
        isBar(visConfig) ? React.createElement(BarVisSidebar, { config: visConfig, setConfig: setVisConfig, columns: columns, className: className, style: style }) : null));
}
//# sourceMappingURL=VisSidebar.js.map