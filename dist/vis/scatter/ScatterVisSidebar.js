import * as React from 'react';
import { useMemo } from 'react';
import { merge } from 'lodash';
import { Container, Divider, Stack } from '@mantine/core';
import { EColumnTypes, } from '../interfaces';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { NumericalColumnSelect } from '../sidebar/NumericalColumnSelect';
import { ColorSelect } from '../sidebar/ColorSelect';
import { FilterButtons } from '../sidebar/FilterButtons';
import { SingleColumnSelect } from '../sidebar/SingleColumnSelect';
import { OpacitySlider } from '../sidebar/OpacitySlider';
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
    },
};
const defaultExtensions = {
    prePlot: null,
    postPlot: null,
    preSidebar: null,
    postSidebar: null,
};
export function ScatterVisSidebar({ config, optionsConfig, extensions, columns, filterCallback = () => null, setConfig, }) {
    const mergedOptionsConfig = useMemo(() => {
        return merge({}, defaultConfig, optionsConfig);
    }, [optionsConfig]);
    const mergedExtensions = useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, [extensions]);
    return (React.createElement(Container, { fluid: true, sx: { width: '100%' }, p: 10 },
        React.createElement(Stack, { spacing: 0 },
            React.createElement(VisTypeSelect, { callback: (type) => setConfig({ ...config, type }), currentSelected: config.type }),
            React.createElement(Divider, { my: "sm" }),
            React.createElement(NumericalColumnSelect, { callback: (numColumnsSelected) => setConfig({ ...config, numColumnsSelected }), columns: columns, currentSelected: config.numColumnsSelected || [] }),
            React.createElement(Divider, { my: "sm" }),
            mergedExtensions.preSidebar,
            React.createElement(Stack, null,
                mergedOptionsConfig.color.enable
                    ? mergedOptionsConfig.color.customComponent || (React.createElement(ColorSelect, { callback: (color) => setConfig({ ...config, color }), numTypeCallback: (numColorScaleType) => setConfig({ ...config, numColorScaleType }), currentNumType: config.numColorScaleType, columns: columns, currentSelected: config.color }))
                    : null,
                mergedOptionsConfig.shape.enable
                    ? mergedOptionsConfig.shape.customComponent || (React.createElement(SingleColumnSelect, { label: "Shape", type: [EColumnTypes.CATEGORICAL], callback: (shape) => setConfig({ ...config, shape }), columns: columns, currentSelected: config.shape }))
                    : null),
            React.createElement(Divider, { my: "sm" }),
            React.createElement(Stack, { spacing: 30 },
                React.createElement(OpacitySlider, { callback: (e) => {
                        if (config.alphaSliderVal !== e) {
                            setConfig({ ...config, alphaSliderVal: e });
                        }
                    }, currentValue: config.alphaSliderVal }),
                mergedOptionsConfig.filter.enable ? mergedOptionsConfig.filter.customComponent || React.createElement(FilterButtons, { callback: filterCallback }) : null),
            mergedExtensions.postSidebar)));
}
//# sourceMappingURL=ScatterVisSidebar.js.map