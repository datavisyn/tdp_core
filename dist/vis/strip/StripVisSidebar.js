import * as React from 'react';
import { useMemo } from 'react';
import { merge } from 'lodash';
import { Container, Divider, Stack } from '@mantine/core';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { NumericalColumnSelect } from '../sidebar/NumericalColumnSelect';
import { CategoricalColumnSelect } from '../sidebar/CategoricalColumnSelect';
const defaultExtensions = {
    prePlot: null,
    postPlot: null,
    preSidebar: null,
    postSidebar: null,
};
export function StripVisSidebar({ config, extensions, columns, setConfig, }) {
    const mergedExtensions = useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, [extensions]);
    return (React.createElement(Container, { p: 10, fluid: true, sx: { width: '100%' } },
        React.createElement(Stack, { spacing: 0 },
            React.createElement(VisTypeSelect, { callback: (type) => setConfig({ ...config, type }), currentSelected: config.type }),
            React.createElement(Divider, { my: "sm" }),
            React.createElement(Stack, { spacing: "sm" },
                React.createElement(NumericalColumnSelect, { callback: (numColumnsSelected) => setConfig({ ...config, numColumnsSelected }), columns: columns, currentSelected: config.numColumnsSelected || [] }),
                React.createElement(CategoricalColumnSelect, { callback: (catColumnsSelected) => setConfig({ ...config, catColumnsSelected }), columns: columns, currentSelected: config.catColumnsSelected || [] })),
            mergedExtensions.preSidebar,
            mergedExtensions.postSidebar)));
}
//# sourceMappingURL=StripVisSidebar.js.map