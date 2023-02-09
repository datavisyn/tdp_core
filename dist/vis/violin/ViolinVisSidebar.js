import * as React from 'react';
import { useMemo } from 'react';
import { merge } from 'lodash';
import { Container, Divider, Stack } from '@mantine/core';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { NumericalColumnSelect } from '../sidebar/NumericalColumnSelect';
import { CategoricalColumnSelect } from '../sidebar/CategoricalColumnSelect';
import { ViolinOverlayButtons } from '../sidebar/ViolinOverlayButtons';
const defaultConfig = {
    overlay: {
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
export function ViolinVisSidebar({ config, optionsConfig, extensions, columns, setConfig, className = '', style: { width = '20em', ...style } = {}, }) {
    const mergedOptionsConfig = useMemo(() => {
        return merge({}, defaultConfig, optionsConfig);
    }, [optionsConfig]);
    const mergedExtensions = useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, [extensions]);
    return (React.createElement(Container, { fluid: true, sx: { width: '100%' }, p: 10 },
        React.createElement(VisTypeSelect, { callback: (type) => setConfig({ ...config, type }), currentSelected: config.type }),
        React.createElement(Divider, { my: "sm" }),
        React.createElement(Stack, { spacing: "sm" },
            React.createElement(NumericalColumnSelect, { callback: (numColumnsSelected) => setConfig({ ...config, numColumnsSelected }), columns: columns, currentSelected: config.numColumnsSelected || [] }),
            React.createElement(CategoricalColumnSelect, { callback: (catColumnsSelected) => setConfig({ ...config, catColumnsSelected }), columns: columns, currentSelected: config.catColumnsSelected || [] })),
        React.createElement(Divider, { my: "sm" }),
        mergedExtensions.preSidebar,
        mergedOptionsConfig.overlay.enable
            ? mergedOptionsConfig.overlay.customComponent || (React.createElement(ViolinOverlayButtons, { callback: (violinOverlay) => setConfig({ ...config, violinOverlay }), currentSelected: config.violinOverlay }))
            : null,
        mergedExtensions.postSidebar));
}
//# sourceMappingURL=ViolinVisSidebar.js.map