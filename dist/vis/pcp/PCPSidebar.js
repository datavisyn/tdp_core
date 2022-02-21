import * as React from 'react';
import { useMemo } from 'react';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { NumericalColumnSelect } from '../sidebar/NumericalColumnSelect';
import { ColorSelect } from '../sidebar/ColorSelect';
import { ShapeSelect } from '../sidebar/ShapeSelect';
import { FilterButtons } from '../sidebar/FilterButtons';
import { merge } from 'lodash';
import { WarningMessage } from '../sidebar/WarningMessage';
const defaultConfig = {
    color: {
        enable: true,
        customComponent: null,
    },
    shape: {
        enable: true,
        customComponent: null,
    },
    filter: {
        enable: true,
        customComponent: null,
    }
};
const defaultExtensions = {
    prePlot: null,
    postPlot: null,
    preSidebar: null,
    postSidebar: null
};
export function ScatterVisSidebar({ config, optionsConfig, extensions, columns, filterCallback = () => null, setConfig, width = '20rem' }) {
    const uniqueId = useMemo(() => {
        return Math.random().toString(36).substr(2, 5);
    }, []);
    const mergedOptionsConfig = useMemo(() => {
        return merge({}, defaultConfig, optionsConfig);
    }, []);
    const mergedExtensions = useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, []);
    return (React.createElement("div", { className: "container pb-3", style: { width } },
        React.createElement(WarningMessage, null),
        React.createElement(VisTypeSelect, { callback: (type) => setConfig({ ...config, type }), currentSelected: config.type }),
        React.createElement("hr", null),
        React.createElement(NumericalColumnSelect, { callback: (numColumnsSelected) => setConfig({ ...config, numColumnsSelected }), columns: columns, currentSelected: config.numColumnsSelected || [] }),
        React.createElement("hr", null),
        mergedExtensions.preSidebar,
        mergedOptionsConfig.color.enable ? mergedOptionsConfig.color.customComponent
            || React.createElement(ColorSelect, { callback: (color) => setConfig({ ...config, color }), numTypeCallback: (numColorScaleType) => setConfig({ ...config, numColorScaleType }), currentNumType: config.numColorScaleType, columns: columns, currentSelected: config.color }) : null,
        mergedOptionsConfig.shape.enable ? mergedOptionsConfig.shape.customComponent
            || React.createElement(ShapeSelect, { callback: (shape) => setConfig({ ...config, shape }), columns: columns, currentSelected: config.shape }) : null,
        React.createElement("hr", null),
        mergedOptionsConfig.filter.enable ? mergedOptionsConfig.filter.customComponent
            || React.createElement(FilterButtons, { callback: filterCallback }) : null,
        mergedExtensions.postSidebar));
}
//# sourceMappingURL=PCPSidebar.js.map