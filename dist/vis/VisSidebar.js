import * as React from 'react';
import { isBar } from './bar/utils';
import { isScatter } from './scatter/utils';
import { isViolin } from './violin/utils';
import { isStrip } from './strip/utils';
import { BarVisSidebar } from './bar/BarVisSidebar';
import { StripVisSidebar } from './strip/StripVisSidebar';
import { ViolinVisSidebar } from './violin/ViolinVisSidebar';
import { ScatterVisSidebar } from './scatter/ScatterVisSidebar';
import { isSankey } from './sankey';
import { SankeyVisSidebar } from './sankey/SankeyVisSidebar';
export function VisSidebar({ columns, filterCallback = () => null, config = null, setConfig = null, className, style }) {
    if (!config) {
        return null;
    }
    return (React.createElement(React.Fragment, null,
        isSankey(config) ? React.createElement(SankeyVisSidebar, { config: config, setConfig: setConfig, className: className, style: style, columns: columns }) : null,
        isScatter(config) ? (React.createElement(ScatterVisSidebar, { config: config, optionsConfig: {
                color: {
                    enable: true,
                },
            }, setConfig: setConfig, filterCallback: filterCallback, columns: columns, className: className, style: style })) : null,
        isViolin(config) ? (React.createElement(ViolinVisSidebar, { config: config, optionsConfig: {
                overlay: {
                    enable: true,
                },
            }, setConfig: setConfig, columns: columns, className: className, style: style })) : null,
        isStrip(config) ? React.createElement(StripVisSidebar, { config: config, setConfig: setConfig, columns: columns, className: className, style: style }) : null,
        isBar(config) ? React.createElement(BarVisSidebar, { config: config, setConfig: setConfig, columns: columns, className: className, style: style }) : null));
}
//# sourceMappingURL=VisSidebar.js.map