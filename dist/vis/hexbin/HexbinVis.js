import * as React from 'react';
import { merge, uniqueId } from 'lodash';
import { useMemo, useRef, useState } from 'react';
import { ActionIcon, Center, Container, Group, SimpleGrid, Stack } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { InvalidCols } from '../general';
import { I18nextManager } from '../../i18n/I18nextManager';
import { Hexplot } from './Hexplot';
import { HexbinVisSidebar } from './HexbinVisSidebar';
import { VisSidebarWrapper } from '../VisSidebarWrapper';
import { BrushOptionButtons } from '../sidebar';
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
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const ref = useRef();
    const id = React.useMemo(() => uniqueId('PCPVis'), []);
    return (React.createElement(Container, { p: 0, fluid: true, sx: { flexGrow: 1, height: '100%', overflow: 'hidden' }, ref: ref },
        React.createElement(ActionIcon, { sx: { position: 'absolute', top: '10px', right: '10px' }, onClick: () => setSidebarOpen(true) },
            React.createElement(FontAwesomeIcon, { icon: faGear })),
        React.createElement(Stack, { spacing: 0, sx: { height: '100%' } },
            React.createElement(Center, null,
                React.createElement(Group, { mt: "lg" },
                    React.createElement(BrushOptionButtons, { callback: (dragMode) => setConfig({ ...config, dragMode }), dragMode: config.dragMode }))),
            React.createElement(SimpleGrid, { style: { height: '100%' } }, config.numColumnsSelected.length < 2 ? (React.createElement(InvalidCols, { headerMessage: I18nextManager.getInstance().i18n.t('tdp:core.vis.errorHeader'), bodyMessage: I18nextManager.getInstance().i18n.t('tdp:core.vis.scatterError') })) : (React.createElement(React.Fragment, null,
                config.numColumnsSelected.length > 2 ? (config.numColumnsSelected.map((xCol) => {
                    return config.numColumnsSelected.map((yCol) => {
                        if (xCol.id !== yCol.id) {
                            return (React.createElement(Hexplot, { key: yCol.id + xCol.id, selectionCallback: selectionCallback, selected: selected, config: config, columns: columns.filter((col) => col.info.id === xCol.id || col.info.id === yCol.id || col.info.id === config.color?.id) }));
                        }
                        return React.createElement("div", { key: `${xCol.id}hist` });
                    });
                })) : (React.createElement(Hexplot, { selectionCallback: selectionCallback, selected: selected, config: config, columns: columns })),
                mergedExtensions.postPlot)))),
        !hideSidebar ? (React.createElement(VisSidebarWrapper, { id: id, target: ref.current, open: sidebarOpen, onClose: () => setSidebarOpen(false) },
            React.createElement(HexbinVisSidebar, { config: config, extensions: extensions, columns: columns, setConfig: setConfig }))) : null));
}
//# sourceMappingURL=HexbinVis.js.map