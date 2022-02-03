import * as React from 'react';
import { useEffect, useState } from 'react';
import { barMergeDefaultConfig, isBar } from './bar/utils';
import { ENumericalColorScaleType, isScatter, scatterMergeDefaultConfig } from './scatter/utils';
import { ESupportedPlotlyVis } from './interfaces';
import { isViolin, violinMergeDefaultConfig } from './violin/utils';
import { isStrip, stripMergeDefaultConfig } from './strip/utils';
import { isPCP, pcpMergeDefaultConfig } from './pcp/utils';
import { PCPVisSidebar } from './pcp/PCPVisSidebar';
import { BarVisSidebar } from './bar/BarVisSidebar';
import { StripVisSidebar } from './strip/StripVisSidebar';
import { ViolinVisSidebar } from './violin/ViolinVisSidebar';
import { ScatterVisSidebar } from './scatter/ScatterVisSidebar';
export function VisSidebar({ columns, filterCallback = () => null, externalConfig = null, setExternalConfig = null, }) {
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
        setExternalConfig(externalConfig);
    }, [visConfig]);
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
    return (React.createElement(React.Fragment, null,
        isScatter(visConfig) ?
            React.createElement(ScatterVisSidebar, { config: visConfig, optionsConfig: {
                    color: {
                        enable: true,
                    }
                }, setConfig: setVisConfig, filterCallback: filterCallback, columns: columns }) : null,
        isViolin(visConfig) ?
            React.createElement(ViolinVisSidebar, { config: visConfig, optionsConfig: {
                    overlay: {
                        enable: true,
                    }
                }, setConfig: setVisConfig, columns: columns }) : null,
        isStrip(visConfig) ?
            React.createElement(StripVisSidebar, { config: visConfig, setConfig: setVisConfig, columns: columns }) : null,
        isPCP(visConfig) ?
            React.createElement(PCPVisSidebar, { config: visConfig, setConfig: setVisConfig, columns: columns }) : null,
        isBar(visConfig) ?
            React.createElement(BarVisSidebar, { config: visConfig, setConfig: setVisConfig, columns: columns }) : null));
}
//# sourceMappingURL=VisSidebar.js.map