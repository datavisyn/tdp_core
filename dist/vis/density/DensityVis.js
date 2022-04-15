import * as React from 'react';
import { merge, uniqueId } from 'lodash';
import { useMemo } from 'react';
import { DensityVisSidebar } from './DensityVisSidebar';
import { HexagonalBin } from './HexagonalBin';
import { HexBrushOptions } from '../sidebar/HexBrushOptions';
import { InvalidCols } from '../general';
import { I18nextManager } from '../../i18n/I18nextManager';
const defaultExtensions = {
    prePlot: null,
    postPlot: null,
    preSidebar: null,
    postSidebar: null,
};
export function DensityVis({ config, extensions, columns, setConfig, selectionCallback = () => null, selected = {}, hideSidebar = false }) {
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
                        return (React.createElement(HexagonalBin, { selectionCallback: selectionCallback, selected: selected, config: config, columns: columns.filter((col) => { var _a; return col.info.id === xCol.id || col.info.id === yCol.id || col.info.id === ((_a = config.color) === null || _a === void 0 ? void 0 : _a.id); }) }));
                    }
                    return React.createElement("div", { key: `${xCol.id}hist` });
                });
            })) : (React.createElement(React.Fragment, null,
                React.createElement("div", { className: "position-absolute top-0 start-50 translate-middle-x" },
                    React.createElement(HexBrushOptions, { callback: (dragMode) => setConfig({ ...config, dragMode }), dragMode: config.dragMode })),
                React.createElement(HexagonalBin, { selectionCallback: selectionCallback, selected: selected, config: config, columns: columns }))),
            mergedExtensions.postPlot))),
        !hideSidebar ? (React.createElement("div", { className: "position-relative h-100 flex-shrink-1 bg-light overflow-auto mt-2" },
            React.createElement("button", { className: "btn btn-primary-outline", type: "button", "data-bs-toggle": "collapse", "data-bs-target": `#generalVisBurgerMenu${id}`, "aria-expanded": "true", "aria-controls": "generalVisBurgerMenu" },
                React.createElement("i", { className: "fas fa-bars" })),
            React.createElement("div", { className: "collapse show collapse-horizontal", id: `generalVisBurgerMenu${id}` },
                React.createElement(DensityVisSidebar, { config: config, extensions: extensions, columns: columns, setConfig: setConfig })))) : null));
}
//# sourceMappingURL=DensityVis.js.map