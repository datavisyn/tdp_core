import * as React from 'react';
import { merge, uniqueId } from 'lodash';
import { useMemo } from 'react';
import { InvalidCols } from '../general';
import { I18nextManager } from '../../i18n/I18nextManager';
import { Hexplot } from './Hexplot';
import { HexbinVisSidebar } from './HexbinVisSidebar';
const defaultExtensions = {
    prePlot: null,
    postPlot: null,
    preSidebar: null,
    postSidebar: null,
};
export function HexbinVis({ config, extensions, columns, setConfig, selectionCallback = () => null, selected = {}, hideSidebar = false }) {
    const mergedExtensions = useMemo(() => {
        return merge({}, defaultExtensions, extensions);
    }, [extensions]);
    const id = React.useMemo(() => uniqueId('PCPVis'), []);
    return (React.createElement("div", { className: "d-flex flex-row w-100 h-100", style: { minHeight: '0px' } },
        React.createElement("div", { className: "position-relative d-grid flex-grow-1 justify-content-center", style: { gridTemplateColumns: 'minmax(0, 1fr) '.repeat(config.numColumnsSelected.length < 3 ? 1 : config.numColumnsSelected.length) } }, config.numColumnsSelected.length < 2 ? (React.createElement("div", { className: "justify-content-center align-items-center d-flex" },
            React.createElement(InvalidCols, { headerMessage: I18nextManager.getInstance().i18n.t('tdp:core.vis.errorHeader'), bodyMessage: I18nextManager.getInstance().i18n.t('tdp:core.vis.scatterError') }))) : (React.createElement(React.Fragment, null,
            config.numColumnsSelected.length > 2 ? (config.numColumnsSelected.map((xCol) => {
                return config.numColumnsSelected.map((yCol) => {
                    if (xCol.id !== yCol.id) {
                        return (React.createElement(Hexplot, { key: yCol.id + xCol.id, selectionCallback: selectionCallback, selected: selected, config: config, columns: columns.filter((col) => col.info.id === xCol.id || col.info.id === yCol.id || col.info.id === config.color?.id) }));
                    }
                    return React.createElement("div", { key: `${xCol.id}hist` });
                });
            })) : (React.createElement(Hexplot, { selectionCallback: selectionCallback, selected: selected, config: config, columns: columns })),
            mergedExtensions.postPlot))),
        !hideSidebar ? (React.createElement("div", { className: "position-relative h-100 flex-shrink-1 bg-light overflow-auto mt-2" },
            React.createElement("button", { className: "btn btn-primary-outline", type: "button", "data-bs-toggle": "collapse", "data-bs-target": `#generalVisBurgerMenu${id}`, "aria-expanded": "true", "aria-controls": "generalVisBurgerMenu" },
                React.createElement("i", { className: "fas fa-bars" })),
            React.createElement("div", { className: "collapse show collapse-horizontal", id: `generalVisBurgerMenu${id}` },
                React.createElement(HexbinVisSidebar, { config: config, extensions: extensions, columns: columns, setConfig: setConfig })))) : null));
}
//# sourceMappingURL=HexbinVis.js.map