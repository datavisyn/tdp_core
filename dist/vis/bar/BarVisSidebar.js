import * as React from 'react';
import { useMemo } from 'react';
import { merge } from 'lodash';
import { Container, Divider, Stack } from '@mantine/core';
import { EColumnTypes, } from '../interfaces';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { GroupSelect } from '../sidebar/GroupSelect';
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
    return (React.createElement(Container, { p: 10, fluid: true, sx: { width: '100%' } },
        React.createElement(VisTypeSelect, { callback: (type) => setConfig({ ...config, type }), currentSelected: config.type }),
        React.createElement(Divider, { my: "sm" }),
        React.createElement(Stack, { spacing: "sm" },
            React.createElement(SingleColumnSelect, { callback: (catColumnSelected) => setConfig({
                    ...config,
                    catColumnSelected,
                    multiples: config.multiples && config.multiples.id === catColumnSelected?.id ? null : config.multiples,
                    group: config.group && config.group.id === catColumnSelected?.id ? null : config.group,
                }), columns: columns, currentSelected: config.catColumnSelected, type: [EColumnTypes.CATEGORICAL], label: "Categorical column" }),
            React.createElement(AggregateTypeSelect, { aggregateTypeSelectCallback: (aggregateType) => {
                    if (config.aggregateColumn === null) {
                        setConfig({ ...config, aggregateType, aggregateColumn: columns.find((col) => col.type === EColumnTypes.NUMERICAL).info });
                    }
                    else {
                        setConfig({ ...config, aggregateType });
                    }
                }, aggregateColumnSelectCallback: (aggregateColumn) => setConfig({ ...config, aggregateColumn }), columns: columns, currentSelected: config.aggregateType, aggregateColumn: config.aggregateColumn })),
        React.createElement(Divider, { my: "sm" }),
        mergedExtensions.preSidebar,
        React.createElement(Stack, { spacing: "sm" },
            mergedOptionsConfig.group.enable
                ? mergedOptionsConfig.group.customComponent || (React.createElement(GroupSelect, { groupColumnSelectCallback: (group) => setConfig({ ...config, group }), groupTypeSelectCallback: (groupType) => setConfig({ ...config, groupType }), groupDisplaySelectCallback: (display) => setConfig({ ...config, display }), displayType: config.display, groupType: config.groupType, columns: columns.filter((c) => config.catColumnSelected && c.info.id !== config.catColumnSelected.id), currentSelected: config.group }))
                : null,
            mergedOptionsConfig.multiples.enable
                ? mergedOptionsConfig.multiples.customComponent || (React.createElement(SingleColumnSelect, { callback: (multiples) => setConfig({ ...config, multiples }), columns: columns.filter((c) => config.catColumnSelected && c.info.id !== config.catColumnSelected.id), currentSelected: config.multiples, label: "Multiples", type: [EColumnTypes.CATEGORICAL] }))
                : null),
        React.createElement(Divider, { my: "sm" }),
        mergedOptionsConfig.direction.enable
            ? mergedOptionsConfig.direction.customComponent || (React.createElement(BarDirectionButtons, { callback: (direction) => setConfig({ ...config, direction }), currentSelected: config.direction }))
            : null,
        mergedExtensions.postSidebar));
}
//# sourceMappingURL=BarVisSidebar.js.map