import * as React from 'react';
import { useMemo } from 'react';
import { merge } from 'lodash';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { WarningMessage } from '../sidebar/WarningMessage';
import { NumericalColumnSelect } from '../sidebar';
import { CategoricalColumnSingleSelect } from '../sidebar/CategoricalColumnSingleSelect';
const defaultExtensions = {
    prePlot: null,
    postPlot: null,
    preSidebar: null,
    postSidebar: null,
};
export function DensityVisSidebar({ config, extensions, columns, setConfig, width = '20rem' }) {
    const mergedExtensions = useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, [extensions]);
    return (React.createElement("div", { className: "container pb-3 pt-2", style: { width } },
        React.createElement(WarningMessage, null),
        React.createElement(VisTypeSelect, { callback: (type) => setConfig({ ...config, type }), currentSelected: config.type }),
        React.createElement("hr", null),
        React.createElement(NumericalColumnSelect, { callback: (numColumnsSelected) => setConfig({ ...config, numColumnsSelected }), columns: columns, currentSelected: config.numColumnsSelected || [] }),
        React.createElement(CategoricalColumnSingleSelect, { callback: (color) => setConfig({ ...config, color }), columns: columns, currentSelected: config.color }),
        React.createElement("hr", null),
        mergedExtensions.preSidebar,
        mergedExtensions.postSidebar));
}
//# sourceMappingURL=DensityVisSidebar.js.map