import * as React from 'react';
import { useMemo } from 'react';
import { merge } from 'lodash';
import { EColumnTypes, } from '../interfaces';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { WarningMessage } from '../sidebar/WarningMessage';
import { GroupSelect } from '../sidebar/GroupSelect';
import { MultiplesSelect } from '../sidebar/MultiplesSelect';
import { BarDirectionButtons } from '../sidebar/BarDirectionButtons';
import { SingleColumnSelect } from '../sidebar/SingleColumnSelect';
import { AggregateTypeSelect } from '../sidebar/AggregateTypeSelect';
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
    },
};
const defaultExtensions = {
    prePlot: null,
    postPlot: null,
    preSidebar: null,
    postSidebar: null,
};
export function BarVisSidebar({ config, optionsConfig, extensions, columns, setConfig, className = '', style: { width = '20em', ...style } = {}, }) {
    const mergedOptionsConfig = useMemo(() => {
        return merge({}, defaultConfig, optionsConfig);
    }, [optionsConfig]);
    const mergedExtensions = useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, [extensions]);
    return (React.createElement("div", { className: `container pb-3 pt-2 ${className}`, style: { width, ...style } },
        React.createElement(WarningMessage, null),
        React.createElement(VisTypeSelect, { callback: (type) => setConfig({ ...config, type }), currentSelected: config.type }),
        React.createElement("hr", null),
        React.createElement(SingleColumnSelect, { callback: (catColumnSelected) => setConfig({
                ...config,
                catColumnSelected,
                multiples: config.multiples && config.multiples.id === catColumnSelected.id ? null : config.multiples,
                group: config.group && config.group.id === catColumnSelected.id ? null : config.group,
            }), columns: columns, currentSelected: config.catColumnSelected, type: [EColumnTypes.CATEGORICAL], label: "Categorical Column" }),
        React.createElement(AggregateTypeSelect, { aggregateTypeSelectCallback: (aggregateType) => {
                if (config.aggregateColumn === null) {
                    setConfig({ ...config, aggregateType, aggregateColumn: columns.find((col) => col.type === EColumnTypes.NUMERICAL).info });
                }
                else {
                    setConfig({ ...config, aggregateType });
                }
            }, aggregateColumnSelectCallback: (aggregateColumn) => setConfig({ ...config, aggregateColumn }), columns: columns, currentSelected: config.aggregateType, aggregateColumn: config.aggregateColumn }),
        React.createElement("hr", null),
        mergedExtensions.preSidebar,
        mergedOptionsConfig.group.enable
            ? mergedOptionsConfig.group.customComponent || (React.createElement(GroupSelect, { groupColumnSelectCallback: (group) => setConfig({ ...config, group }), groupTypeSelectCallback: (groupType) => setConfig({ ...config, groupType }), groupDisplaySelectCallback: (display) => setConfig({ ...config, display }), displayType: config.display, groupType: config.groupType, columns: columns.filter((c) => config.catColumnSelected && c.info.id !== config.catColumnSelected.id), currentSelected: config.group }))
            : null,
        mergedOptionsConfig.multiples.enable
            ? mergedOptionsConfig.multiples.customComponent || (React.createElement(MultiplesSelect, { callback: (multiples) => setConfig({ ...config, multiples }), columns: columns.filter((c) => config.catColumnSelected && c.info.id !== config.catColumnSelected.id), currentSelected: config.multiples }))
            : null,
        React.createElement("hr", null),
        mergedOptionsConfig.direction.enable
            ? mergedOptionsConfig.direction.customComponent || (React.createElement(BarDirectionButtons, { callback: (direction) => setConfig({ ...config, direction }), currentSelected: config.direction }))
            : null,
        mergedExtensions.postSidebar));
}
//# sourceMappingURL=BarVisSidebar.js.map