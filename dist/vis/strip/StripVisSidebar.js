import * as React from 'react';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { NumericalColumnSelect } from '../sidebar/NumericalColumnSelect';
import { WarningMessage } from '../sidebar/WarningMessage';
import { CategoricalColumnSelect } from '../sidebar/CategoricalColumnSelect';
export function StripVisSidebar({ config, columns, setConfig, className = '', style: { width = '20em', ...style } = {}, }) {
    return (React.createElement("div", { className: `container pb-3 pt-2 ${className}`, style: { width, ...style } },
        React.createElement(WarningMessage, null),
        React.createElement(VisTypeSelect, { callback: (type) => setConfig({ ...config, type }), currentSelected: config.type }),
        React.createElement("hr", null),
        React.createElement(NumericalColumnSelect, { callback: (numColumnsSelected) => setConfig({ ...config, numColumnsSelected }), columns: columns, currentSelected: config.numColumnsSelected || [] }),
        React.createElement(CategoricalColumnSelect, { callback: (catColumnsSelected) => setConfig({ ...config, catColumnsSelected }), columns: columns, currentSelected: config.catColumnsSelected || [] }),
        React.createElement("hr", null)));
}
//# sourceMappingURL=StripVisSidebar.js.map