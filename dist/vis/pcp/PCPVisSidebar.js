import * as React from 'react';
import { useMemo } from 'react';
import { merge } from 'lodash';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { WarningMessage } from '../sidebar/WarningMessage';
import { AllColumnSelect } from '../sidebar';
const defaultExtensions = {
    prePlot: null,
    postPlot: null,
    preSidebar: null,
    postSidebar: null,
};
export function PCPVisSidebar({ config, extensions, columns, setConfig, className = '', style: { width = '20em', ...style } = {}, }) {
    const mergedExtensions = useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, [extensions]);
    return (React.createElement("div", { className: `container pb-3 pt-2 ${className}`, style: { width, ...style } },
        React.createElement(WarningMessage, null),
        React.createElement(VisTypeSelect, { callback: (type) => setConfig({ ...config, type }), currentSelected: config.type }),
        React.createElement("hr", null),
        React.createElement(AllColumnSelect, { callback: (allColumnsSelected) => setConfig({ ...config, allColumnsSelected }), columns: columns, currentSelected: config.allColumnsSelected || [] }),
        React.createElement("hr", null),
        mergedExtensions.preSidebar,
        mergedExtensions.postSidebar));
}
//# sourceMappingURL=PCPVisSidebar.js.map