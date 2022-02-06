import * as React from 'react';
import { useMemo } from 'react';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { merge } from 'lodash';
import { WarningMessage } from '../sidebar/WarningMessage';
import { BarDirectionButtons, BarDisplayButtons, BarGroupTypeButtons, CategoricalColumnSelect, GroupSelect, MultiplesSelect } from '..';
const defaultConfig = {
    group: {
        enable: true,
        customComponent: null,
    },
    multiples: {
        enable: true,
        customComponent: null,
    },
    direction: {
        enable: true,
        customComponent: null,
    },
    groupType: {
        enable: true,
        customComponent: null,
    },
    display: {
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
export function BarVisSidebar({ config, optionsConfig, extensions, columns, setConfig, width = '20rem' }) {
    const uniqueId = useMemo(() => {
        return Math.random().toString(36).substr(2, 5);
    }, []);
    const mergedOptionsConfig = useMemo(() => {
        return merge({}, defaultConfig, optionsConfig);
    }, []);
    const mergedExtensions = useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, []);
    return (React.createElement("div", { className: "container pb-3 pt-2", style: { width } },
        React.createElement(WarningMessage, null),
        React.createElement(VisTypeSelect, { callback: (type) => setConfig({ ...config, type }), currentSelected: config.type }),
        React.createElement("hr", null),
        React.createElement(CategoricalColumnSelect, { callback: (catColumnsSelected) => setConfig({ ...config, catColumnsSelected }), columns: columns, currentSelected: config.catColumnsSelected || [] }),
        React.createElement("hr", null),
        mergedExtensions.preSidebar,
        mergedOptionsConfig.group.enable ? mergedOptionsConfig.group.customComponent
            || React.createElement(GroupSelect, { callback: (group) => setConfig({ ...config, group }), columns: columns, currentSelected: config.group }) : null,
        mergedOptionsConfig.multiples.enable ? mergedOptionsConfig.multiples.customComponent
            || React.createElement(MultiplesSelect, { callback: (multiples) => setConfig({ ...config, multiples }), columns: columns, currentSelected: config.multiples }) : null,
        React.createElement("hr", null),
        mergedOptionsConfig.direction.enable ? mergedOptionsConfig.direction.customComponent
            || React.createElement(BarDirectionButtons, { callback: (direction) => setConfig({ ...config, direction }), currentSelected: config.direction }) : null,
        mergedOptionsConfig.groupType.enable ? mergedOptionsConfig.groupType.customComponent
            || React.createElement(BarGroupTypeButtons, { callback: (groupType) => setConfig({ ...config, groupType }), currentSelected: config.groupType }) : null,
        mergedOptionsConfig.display.enable ? mergedOptionsConfig.display.customComponent
            || React.createElement(BarDisplayButtons, { callback: (display) => setConfig({ ...config, display }), currentSelected: config.display }) : null,
        mergedExtensions.postSidebar));
}
//# sourceMappingURL=BarVisSidebar.js.map