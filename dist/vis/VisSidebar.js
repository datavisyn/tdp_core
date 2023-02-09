import * as React from 'react';
import { isBar } from './bar/utils';
import { isScatter } from './scatter/utils';
import { isViolin } from './violin/utils';
import { BarVisSidebar } from './bar/BarVisSidebar';
import { ViolinVisSidebar } from './violin/ViolinVisSidebar';
import { ScatterVisSidebar } from './scatter/ScatterVisSidebar';
export function VisSidebar({ columns, filterCallback = () => null, externalConfig = null, setExternalConfig = null, className, style }) {
    if (!externalConfig) {
        return null;
    }
    return (React.createElement(React.Fragment, null,
        isScatter(externalConfig) ? (React.createElement(ScatterVisSidebar, { config: externalConfig, optionsConfig: {
                color: {
                    enable: true,
                },
            }, setConfig: setExternalConfig, filterCallback: filterCallback, columns: columns, className: className, style: style })) : null,
        isViolin(externalConfig) ? (React.createElement(ViolinVisSidebar, { config: externalConfig, optionsConfig: {
                overlay: {
                    enable: true,
                },
            }, setConfig: setExternalConfig, columns: columns, className: className, style: style })) : null,
        isBar(externalConfig) ? (React.createElement(BarVisSidebar, { config: externalConfig, setConfig: setExternalConfig, columns: columns, className: className, style: style })) : null));
}
//# sourceMappingURL=VisSidebar.js.map