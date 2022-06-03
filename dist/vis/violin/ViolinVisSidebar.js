import * as React from 'react';
import { useMemo } from 'react';
import { merge } from 'lodash';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { NumericalColumnSelect } from '../sidebar/NumericalColumnSelect';
import { WarningMessage } from '../sidebar/WarningMessage';
import { CategoricalColumnSelect } from '../sidebar/CategoricalColumnSelect';
import { ViolinOverlayButtons } from '../sidebar/ViolinOverlayButtons';
const defaultConfig = {
    overlay: {
        enable: true,
        customComponent: null,
    },
};
export function ViolinVisSidebar({ config, optionsConfig, columns, setConfig, className = '', style: { width = '20em', ...style } = {}, }) {
    const mergedOptionsConfig = useMemo(() => {
        return merge({}, defaultConfig, optionsConfig);
    }, [optionsConfig]);
    return (React.createElement("div", { className: `container pb-3 pt-2 ${className}`, style: { width, ...style } },
        React.createElement(WarningMessage, null),
        React.createElement(VisTypeSelect, { callback: (type) => setConfig({ ...config, type }), currentSelected: config.type }),
        React.createElement("hr", null),
        React.createElement(NumericalColumnSelect, { callback: (numColumnsSelected) => setConfig({ ...config, numColumnsSelected }), columns: columns, currentSelected: config.numColumnsSelected || [] }),
        React.createElement(CategoricalColumnSelect, { callback: (catColumnsSelected) => setConfig({ ...config, catColumnsSelected }), columns: columns, currentSelected: config.catColumnsSelected || [] }),
        React.createElement("hr", null),
        mergedOptionsConfig.overlay.enable
            ? mergedOptionsConfig.overlay.customComponent || (React.createElement(ViolinOverlayButtons, { callback: (violinOverlay) => setConfig({ ...config, violinOverlay }), currentSelected: config.violinOverlay }))
            : null));
}
//# sourceMappingURL=ViolinVisSidebar.js.map