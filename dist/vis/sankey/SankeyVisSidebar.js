import * as React from 'react';
import { CategoricalColumnSelect } from '../sidebar/CategoricalColumnSelect';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { WarningMessage } from '../sidebar/WarningMessage';
export function SankeyVisSidebar({ config, setConfig, className = '', columns, style: { width = '20em', ...style } = {}, }) {
    console.log(config);
    return (React.createElement("div", { className: `container pb-3 pt-2 ${className}`, style: { width, ...style } },
        React.createElement(WarningMessage, null),
        React.createElement(VisTypeSelect, { callback: (type) => setConfig({ ...config, type }), currentSelected: config.type }),
        React.createElement(CategoricalColumnSelect, { callback: (catColumnsSelected) => setConfig({ ...config, catColumnsSelected }), columns: columns, currentSelected: config.catColumnsSelected || [] })));
}
//# sourceMappingURL=SankeyVisSidebar.js.map